//+------------------------------------------------------------------+
//|                                              SPARTAN MERGED RSI.mq4 |
//|                                                          Saasa Ivanov |
//|                                              https://saasa.jimdo.com |
//+------------------------------------------------------------------+
#property copyright "Saasa Ivanov"
#property link      "https://saasa.jimdo.com"

#property indicator_chart_window
#property indicator_buffers 5
#property indicator_color1 Blue   // up arrow color Set 1
#property indicator_width1 3
#property indicator_color2 Red    // down arrow color Set 1
#property indicator_width2 3
#property indicator_color3 Lime   // up arrow color Set 2
#property indicator_width3 2
#property indicator_color4 Orange // down arrow color Set 2
#property indicator_width4 2

//--- input parameters
enum MYENUM { Var0, Var1 };
extern ENUM_TIMEFRAMES RSI_Limit_TF = PERIOD_CURRENT;
extern ENUM_APPLIED_PRICE RSI_Price = PRICE_CLOSE;

// Spartan I original parameters
extern int period_RSI5_1   = 30;
extern int period_RSI5_2   = 10;
extern int period_RSI15_1  = 30;
extern int period_RSI15_2  = 10;
extern int period_RSI60_1  = 14;
extern int period_RSI60_2  = 7;

// Spartan II original parameters
extern int period_RSI5_1_II   = 10;
extern int period_RSI5_2_II   = 5;
extern int period_RSI15_1_II  = 10;
extern int period_RSI15_2_II  = 3;
extern int period_RSI60_1_II  = 11;
extern int period_RSI60_2_II  = 2;

extern bool UseSpartanI = true;
extern bool UseSpartanII = true;
extern bool RequireBothAgree = false;

// Range filtering parameters to reduce arrow frequency
extern bool UseRangeFilter = true;           // Enable range filtering
extern double RSI_UpperLimit = 70.0;         // Upper RSI limit for signals
extern double RSI_LowerLimit = 30.0;         // Lower RSI limit for signals
extern int MinBarsBetweenSignals = 5;        // Minimum bars between signals
extern bool UseTrendStrengthFilter = true;   // Only show signals in strong trends
extern double MinTrendStrength = 0.6;        // Minimum trend strength (0.0-1.0)

extern color   ArrowsUpColor = Blue;
extern color   ArrowsDnColor = Red;
extern color   ArrowsUpColor2 = Lime;
extern color   ArrowsDnColor2 = Orange;
extern int     ArrowsUpCode   = 233;
extern int     ArrowsDnCode   = 77;
extern int     ArrowsSize     = 3;
extern double  ArrowUpGap     = 3.0;
extern double  ArrowDnGap     = 3.0;
extern bool    Arrows         = true;
extern bool    AlertsMessage = true;
extern bool    AlertsSound   = false;
extern bool    AlertsEmail   = false;
extern bool    AlertsMobile  = false;
input MYENUM   SIGNAL_BAR     = Var0;

double bBuffer1[];
double sBuffer1[];
double bBuffer2[];
double sBuffer2[];
double trend[];

// Add variables to track last signal state
int lastSignalType = 0; // 0 = no signal, 1 = buy, -1 = sell
datetime lastSignalTime = 0;
int barsSinceLastSignal = 0; // Track bars since last signal

//+------------------------------------------------------------------+
//| Custom indicator initialization function                         |
//+------------------------------------------------------------------+
int OnInit()
{
   IndicatorBuffers(5);
   // Spartan I arrows
   SetIndexStyle(0, DRAW_ARROW, 0, ArrowsSize, ArrowsUpColor);
   SetIndexArrow(0, ArrowsUpCode);
   SetIndexBuffer(0, bBuffer1);
   SetIndexLabel(0, "Spartan I Buy");
   // Spartan I down arrow
   SetIndexStyle(1, DRAW_ARROW, 0, ArrowsSize, ArrowsDnColor);
   SetIndexArrow(1, ArrowsDnCode);
   SetIndexBuffer(1, sBuffer1);
   SetIndexLabel(1, "Spartan I Sell");
   // Spartan II arrows
   SetIndexStyle(2, DRAW_ARROW, 0, ArrowsSize-1, ArrowsUpColor2);
   SetIndexArrow(2, ArrowsUpCode);
   SetIndexBuffer(2, bBuffer2);
   SetIndexLabel(2, "Spartan II Buy");
   // Spartan II down arrow
   SetIndexStyle(3, DRAW_ARROW, 0, ArrowsSize-1, ArrowsDnColor2);
   SetIndexArrow(3, ArrowsDnCode);
   SetIndexBuffer(3, sBuffer2);
   SetIndexLabel(3, "Spartan II Sell");
   // trend buffer (internal)
   SetIndexBuffer(4, trend);

   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Custom indicator iteration function                              |
//+------------------------------------------------------------------+
int start()
{
  int counted = IndicatorCounted();
  if(counted < 0) return(-1);
  if(counted > 0) counted--;

  int limit = Bars - counted;
  for(int i = limit; i >= 1; i--)
  {
    bBuffer1[i] = EMPTY_VALUE;
    sBuffer1[i] = EMPTY_VALUE;
    bBuffer2[i] = EMPTY_VALUE;
    sBuffer2[i] = EMPTY_VALUE;
    
    // Increment bars since last signal
    barsSinceLastSignal++;

    // line up M5, M15, H1 bars exactly
    int y5  = iBarShift(NULL, PERIOD_M5,  Time[i], true);
    int y15 = iBarShift(NULL, PERIOD_M15, Time[i], true);
    int y60 = iBarShift(NULL, PERIOD_H1,  Time[i], true);
    if(y5 < 0 || y15 < 0 || y60 < 0) continue;

    bool spartan1_up = false, spartan1_dn = false;
    bool spartan2_up = false, spartan2_dn = false;

    // Calculate Spartan I signals
    if(UseSpartanI)
    {
      double r5_1   = iRSI(NULL, PERIOD_M5,  period_RSI5_1,   RSI_Price, y5+1);
      double r5_2   = iRSI(NULL, PERIOD_M5,  period_RSI5_2,   RSI_Price, y5+1);
      double r15_1  = iRSI(NULL, PERIOD_M15, period_RSI15_1,  RSI_Price, y15+1);
      double r15_2  = iRSI(NULL, PERIOD_M15, period_RSI15_2,  RSI_Price, y15+1);
      double r60_1  = iRSI(NULL, PERIOD_H1,  period_RSI60_1,  RSI_Price, y60+1);
      double r60_2  = iRSI(NULL, PERIOD_H1,  period_RSI60_2,  RSI_Price, y60+1);

      bool up5  = (r5_2   > r5_1);
      bool dn5  = (r5_2   < r5_1);
      bool up15 = (r15_2  > r15_1);
      bool dn15 = (r15_2  < r15_1);
      bool up60 = (r60_2  > r60_1);
      bool dn60 = (r60_2  < r60_1);

      spartan1_up = (up5 && up15 && up60);
      spartan1_dn = (dn5 && dn15 && dn60);
    }

    // Calculate Spartan II signals
    if(UseSpartanII)
    {
      double r5_1_II   = iRSI(NULL, PERIOD_M5,  period_RSI5_1_II,   RSI_Price, y5+1);
      double r5_2_II   = iRSI(NULL, PERIOD_M5,  period_RSI5_2_II,   RSI_Price, y5+1);
      double r15_1_II  = iRSI(NULL, PERIOD_M15, period_RSI15_1_II,  RSI_Price, y15+1);
      double r15_2_II  = iRSI(NULL, PERIOD_M15, period_RSI15_2_II,  RSI_Price, y15+1);
      double r60_1_II  = iRSI(NULL, PERIOD_H1,  period_RSI60_1_II,  RSI_Price, y60+1);
      double r60_2_II  = iRSI(NULL, PERIOD_H1,  period_RSI60_2_II,  RSI_Price, y60+1);

      bool up5_II  = (r5_2_II   > r5_1_II);
      bool dn5_II  = (r5_2_II   < r5_1_II);
      bool up15_II = (r15_2_II  > r15_1_II);
      bool dn15_II = (r15_2_II  < r15_1_II);
      bool up60_II = (r60_2_II  > r60_1_II);
      bool dn60_II = (r60_2_II  < r60_1_II);

      spartan2_up = (up5_II && up15_II && up60_II);
      spartan2_dn = (dn5_II && dn15_II && dn60_II);
    }

    // Determine final trend
    int prev = trend[i+1];
    int new_trend = prev;

    if(RequireBothAgree)
    {
      // Both must agree
      if(spartan1_up && spartan2_up) new_trend = 1;
      else if(spartan1_dn && spartan2_dn) new_trend = -1;
    }
    else
    {
      // Either can trigger
      if(spartan1_up || spartan2_up) new_trend = 1;
      else if(spartan1_dn || spartan2_dn) new_trend = -1;
    }

    trend[i] = new_trend;

    // Range filtering logic
    bool rangeFilterPassed = true;
    bool timeFilterPassed = true;
    bool strengthFilterPassed = true;
    
    if(UseRangeFilter)
    {
      // Check if we have enough bars since last signal
      timeFilterPassed = (barsSinceLastSignal >= MinBarsBetweenSignals);
      
      // Get current RSI values for range checking
      double currentRSI5 = iRSI(NULL, PERIOD_M5, period_RSI5_2, RSI_Price, y5);
      double currentRSI15 = iRSI(NULL, PERIOD_M15, period_RSI15_2, RSI_Price, y15);
      double currentRSI60 = iRSI(NULL, PERIOD_H1, period_RSI60_2, RSI_Price, y60);
      
      // Check if RSI is in valid range for signals
      if(new_trend > 0) // Buy signal
      {
        rangeFilterPassed = (currentRSI5 <= RSI_UpperLimit && currentRSI15 <= RSI_UpperLimit && currentRSI60 <= RSI_UpperLimit);
      }
      else if(new_trend < 0) // Sell signal
      {
        rangeFilterPassed = (currentRSI5 >= RSI_LowerLimit && currentRSI15 >= RSI_LowerLimit && currentRSI60 >= RSI_LowerLimit);
      }
      
      // Trend strength filter
      if(UseTrendStrengthFilter)
      {
        double avgRSI = (currentRSI5 + currentRSI15 + currentRSI60) / 3.0;
        if(new_trend > 0) // Buy signal
        {
          strengthFilterPassed = (avgRSI >= MinTrendStrength * 100.0);
        }
        else if(new_trend < 0) // Sell signal
        {
          strengthFilterPassed = (avgRSI <= (100.0 - MinTrendStrength * 100.0));
        }
      }
    }

    // Draw arrows only on trend change AND when it's a new signal type AND filters pass
    if(trend[i] != prev && Time[i] != lastSignalTime && rangeFilterPassed && timeFilterPassed && strengthFilterPassed)
    {
      if(trend[i] > 0 && lastSignalType != 1)
      {
        if(spartan1_up && UseSpartanI)
          bBuffer1[i] = Low[i] - ArrowUpGap*5*Point;
        if(spartan2_up && UseSpartanII)
          bBuffer2[i] = Low[i] - (ArrowUpGap+1)*5*Point;
        
        lastSignalType = 1;
        lastSignalTime = Time[i];
        barsSinceLastSignal = 0; // Reset counter when signal is generated
      }
      else if(trend[i] < 0 && lastSignalType != -1)
      {
        if(spartan1_dn && UseSpartanI)
          sBuffer1[i] = High[i] + ArrowDnGap*5*Point;
        if(spartan2_dn && UseSpartanII)
          sBuffer2[i] = High[i] + (ArrowDnGap+1)*5*Point;
        
        lastSignalType = -1;
        lastSignalTime = Time[i];
        barsSinceLastSignal = 0; // Reset counter when signal is generated
      }
    }
  }

  // alerts once per closed bar (shift=1)
  static datetime lastAlertTime = 0;
  if(Time[1] != lastAlertTime)
  {
    bool buySignal = (bBuffer1[1] != EMPTY_VALUE || bBuffer2[1] != EMPTY_VALUE);
    bool sellSignal = (sBuffer1[1] != EMPTY_VALUE || sBuffer2[1] != EMPTY_VALUE);

    if(buySignal)
      SendSignal("BUY");
    else if(sellSignal)
      SendSignal("SELL");
      
    lastAlertTime = Time[1];
  }

  return(0);
}

//+------------------------------------------------------------------+
//| helper to fire alerts                                            |
//+------------------------------------------------------------------+
void SendSignal(string side)
{
  string msg = Symbol()+" "+PeriodString()+" SPARTAN MERGED RSI: "+side+"!";
  if(AlertsMessage) Alert(msg);
  if(AlertsSound)      PlaySound("alert2.wav");
  if(AlertsEmail)      SendMail(Symbol()+" - "+WindowExpertName(), msg);
  if(AlertsMobile)     SendNotification(msg);
}

//+------------------------------------------------------------------+
//| period to string                                                 |
//+------------------------------------------------------------------+
string PeriodString()
{
  switch(Period())
  {
    case PERIOD_M1:  return("M1");
    case PERIOD_M5:  return("M5");
    case PERIOD_M15: return("M15");
    case PERIOD_M30: return("M30");
    case PERIOD_H1:  return("H1");
    case PERIOD_H4:  return("H4");
    case PERIOD_D1:  return("D1");
    case PERIOD_W1:  return("W1");
    case PERIOD_MN1:return("MN1");
    default:         return("P"+IntegerToString(Period()));
  }
} 