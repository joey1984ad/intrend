//+------------------------------------------------------------------+
//|                                    SPARTAN_STRICT_COMPATIBLE.mq4 |
//|                                                     Saasa Ivanov |
//|                                          https://saasa.jimdo.com |
//|                                    LAG REDUCED VERSION - 2024    |
//|                                    ONE ARROW PER SIGNAL VERSION  |
//+------------------------------------------------------------------+
#property copyright "Saasa Ivanov, modified by Joseph S"
#property link      "https://saasa.jimdo.com"
#property version   "2.29"
#property strict

#property indicator_chart_window
#property indicator_buffers 3
#property indicator_color1 DeepSkyBlue   // up arrow
#property indicator_width1 3
#property indicator_color2 Red           // down arrow
#property indicator_width2 3

//---- input parameters
enum MYENUM { Var0, Var1 };
extern ENUM_TIMEFRAMES RSI_Limit_TF = PERIOD_CURRENT;
extern ENUM_APPLIED_PRICE RSI_Price = PRICE_CLOSE;
extern int period_RSI5_1   = 30;
extern int period_RSI5_2   = 10;
extern int period_RSI15_1  = 30;
extern int period_RSI15_2  = 10;
extern int period_RSI60_1  = 14;
extern int period_RSI60_2  = 7;
// ATR Filter Parameters
extern int ATR_Period = 900;
extern double ATR_Multiplier = 3.9;
extern double ATR_MinThreshold = 0.0001; // Minimum ATR threshold (adjust based on instrument)
extern bool UseATRFilter = true;
// Signal Filtering Parameters
extern bool OneArrowPerSignal = true; // Only show one arrow until opposite signal appears
extern color   ArrowsUpColor = DeepSkyBlue;
extern color   ArrowsDnColor = Red;
extern int     ArrowsUpCode  = 233;
extern int     ArrowsDnCode  = 77;
extern int     ArrowsSize    = 3;
extern double  ArrowUpGap    = 3.0;
extern double  ArrowDnGap    = 3.0;
extern bool Arrows        = true;
extern bool AlertsMessage = true;
extern bool AlertsSound   = false;
extern bool AlertsEmail   = false;
extern bool AlertsMobile  = false;
extern bool UseRealTime   = true;  // Use real-time signals (true) or wait for bar close (false)
input MYENUM SIGNAL_BAR    = Var0;

// Initialize arrays with proper sizing
double bBuffer1[];
double sBuffer1[];
double trend[];

// Global variables for signal management
datetime lastAlertTime = 0;
int lastSignalType = 0; // 0 = none, 1 = buy shown, -1 = sell shown

//+------------------------------------------------------------------+
//| Custom indicator initialization                                  |
//+------------------------------------------------------------------+
int OnInit()
{
   // Initialize arrays with proper size
   ArrayResize(bBuffer1, 1000);
   ArrayResize(sBuffer1, 1000);
   ArrayResize(trend, 1000);
   
   // Initialize all values to EMPTY_VALUE
   ArrayInitialize(bBuffer1, EMPTY_VALUE);
   ArrayInitialize(sBuffer1, EMPTY_VALUE);
   ArrayInitialize(trend, 0.0);
   
   IndicatorBuffers(3);
   
   // up arrow
   SetIndexStyle(0, DRAW_ARROW, 0, ArrowsSize, ArrowsUpColor);
   SetIndexArrow(0, ArrowsUpCode);
   SetIndexBuffer(0, bBuffer1);
   SetIndexLabel(0, "Buy");
   
   // down arrow
   SetIndexStyle(1, DRAW_ARROW, 0, ArrowsSize, ArrowsDnColor);
   SetIndexArrow(1, ArrowsDnCode);
   SetIndexBuffer(1, sBuffer1);
   SetIndexLabel(1, "Sell");
   
   // trend buffer (internal)
   SetIndexBuffer(2, trend);
   
   // Reset signal tracking
   lastSignalType = 0;

   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Custom indicator iteration function                              |
//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[],
                const long &volume[],
                const int &spread[])
{
   int limit = 0;
   
   if(prev_calculated < 0) return(-1);
   
   // Ensure arrays are properly sized
   if(ArraySize(bBuffer1) < rates_total)
   {
      ArrayResize(bBuffer1, rates_total);
      ArrayResize(sBuffer1, rates_total);
      ArrayResize(trend, rates_total);
   }
   
   if(prev_calculated == 0)
   {
      limit = rates_total - 1;
      // Reset signal tracking on full recalculation
      lastSignalType = 0;
   }
   else
      limit = rates_total - prev_calculated;
   
   // Process current bar (i >= 0) instead of starting from 1
   for(int i = limit; i >= 0; i--)
   {
      bBuffer1[i] = EMPTY_VALUE;
      sBuffer1[i] = EMPTY_VALUE;

      // Use false for exact=false to reduce lag, allow approximate time matching
      int y5  = iBarShift(NULL, PERIOD_M5,  time[i], false);
      int y15 = iBarShift(NULL, PERIOD_M15, time[i], false);
      int y60 = iBarShift(NULL, PERIOD_H1,  time[i], false);
      
      // Bounds checking for array access
      if(y5 < 0 || y15 < 0 || y60 < 0) continue;

      // Read RSI on current bar (shift = y) instead of closed bar (y+1)
      double r5_1  = iRSI(NULL, PERIOD_M5,  period_RSI5_1,  RSI_Price, y5);
      double r5_2  = iRSI(NULL, PERIOD_M5,  period_RSI5_2,  RSI_Price, y5);
      double r15_1 = iRSI(NULL, PERIOD_M15, period_RSI15_1, RSI_Price, y15);
      double r15_2 = iRSI(NULL, PERIOD_M15, period_RSI15_2, RSI_Price, y15);
      double r60_1 = iRSI(NULL, PERIOD_H1,  period_RSI60_1,  RSI_Price, y60);
      double r60_2 = iRSI(NULL, PERIOD_H1,  period_RSI60_2,  RSI_Price, y60);

      // Check for valid RSI values
      if(r5_1 == 0.0 || r5_2 == 0.0 || r15_1 == 0.0 || r15_2 == 0.0 || r60_1 == 0.0 || r60_2 == 0.0) continue;

      // ATR Filter to reduce noise
      double atr = iATR(NULL, 0, ATR_Period, i);
      double atrThreshold = 0.0;
      
      if(UseATRFilter && atr > 0.0)
      {
         // Calculate ATR threshold based on current ATR value
         atrThreshold = MathMax(atr * ATR_Multiplier, ATR_MinThreshold);
         
         // Check if current bar's range is sufficient
         double currentRange = high[i] - low[i];
         if(currentRange < atrThreshold) continue; // Skip signal if range is too small
      }

      bool up5  = (r5_2  > r5_1);
      bool dn5  = (r5_2  < r5_1);
      bool up15 = (r15_2 > r15_1);
      bool dn15 = (r15_2 < r15_1);
      bool up60 = (r60_2 > r60_1);
      bool dn60 = (r60_2 < r60_1);

      double prev = 0.0;
      if(i + 1 < rates_total)
         prev = trend[i+1];
         
      if(up5 && up15 && up60)      trend[i] =  1.0;
      else if(dn5 && dn15 && dn60) trend[i] = -1.0;
      else                          trend[i] = prev;

      // Draw arrow only on trend flips with enhanced filtering
      if(trend[i] != prev && trend[i] != 0.0) // Trend changed and is not neutral
      {
         if(trend[i] > 0.0) // Bullish trend
         {
            bool canShowBuySignal = true;
            
            if(OneArrowPerSignal)
            {
               // Only show buy arrow if we haven't shown a buy arrow yet
               // OR if the last signal was a sell (meaning trend reversed)
               if(lastSignalType == 1) // Already showed a buy arrow
                  canShowBuySignal = false;
            }
            
            if(canShowBuySignal)
            {
               bBuffer1[i] = low[i] - ArrowUpGap*5.0*_Point;
               lastSignalType = 1; // Mark that we've shown a buy signal
            }
         }
         else if(trend[i] < 0.0) // Bearish trend
         {
            bool canShowSellSignal = true;
            
            if(OneArrowPerSignal)
            {
               // Only show sell arrow if we haven't shown a sell arrow yet
               // OR if the last signal was a buy (meaning trend reversed)
               if(lastSignalType == -1) // Already showed a sell arrow
                  canShowSellSignal = false;
            }
            
            if(canShowSellSignal)
            {
               sBuffer1[i] = high[i] + ArrowDnGap*5.0*_Point;
               lastSignalType = -1; // Mark that we've shown a sell signal
            }
         }
      }
   }

   // alerts based on UseRealTime setting
   int alertBar = UseRealTime ? 0 : 1;  // 0 for real-time, 1 for closed bar
   if(alertBar < rates_total && time[alertBar] != lastAlertTime)
   {
      if(bBuffer1[alertBar] != EMPTY_VALUE)
         SendSignal("BUY");
      else if(sBuffer1[alertBar] != EMPTY_VALUE)
         SendSignal("SELL");
      lastAlertTime = time[alertBar];
   }

   return(rates_total);
}

//+------------------------------------------------------------------+
//| helper to fire alerts                                            |
//+------------------------------------------------------------------+
void SendSignal(string side)
{
   string msg = _Symbol+" "+PeriodString()+" SPARTAN: "+side+"!";
   if(AlertsMessage) Alert(msg);
   if(AlertsSound)   PlaySound("alert2.wav");
   if(AlertsEmail)   SendMail(_Symbol+" - "+WindowExpertName(), msg);
   if(AlertsMobile)  SendNotification(msg);
}

//+------------------------------------------------------------------+
//| period to string                                                 |
//+------------------------------------------------------------------+
string PeriodString()
{
   switch(_Period)
   {
      case PERIOD_M1:  return("M1");
      case PERIOD_M5:  return("M5");
      case PERIOD_M15: return("M15");
      case PERIOD_M30: return("M30");
      case PERIOD_H1:  return("H1");
      case PERIOD_H4:  return("H4");
      case PERIOD_D1:  return("D1");
      case PERIOD_W1:  return("W1");
      case PERIOD_MN1: return("MN1");
      default:         return("P"+IntegerToString(_Period));
   }
} 