//+------------------------------------------------------------------+
//|                                            ARROW DIAMOND RSI.mq4 |
//|                                                     Saasa Ivanov |
//|                                          https://saasa.jimdo.com |
//|                                    LAG REDUCED VERSION - 2024    |
//+------------------------------------------------------------------+
#property strict
#property copyright "Saasa Ivanov"
#property link      "https://saasa.jimdo.com"

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
extern color   ArrowsUpColor = DeepSkyBlue;
extern color   ArrowsDnColor = Red;
extern int     ArrowsUpCode  = 241;
extern int     ArrowsDnCode  = 242;
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

double bBuffer1[];
double sBuffer1[];
double trend[];

datetime TimeBar;
datetime LastProcessedTime;
int prevtime;

//+------------------------------------------------------------------+
//| Custom indicator initialization                                  |
//+------------------------------------------------------------------+
int OnInit()
{
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
   
   // Initialize arrays - completely clear any old signals
   ArrayInitialize(bBuffer1, EMPTY_VALUE);
   ArrayInitialize(sBuffer1, EMPTY_VALUE);
   ArrayInitialize(trend, 0);
   
   // Reset time tracking variables
   TimeBar = 0;
   LastProcessedTime = 0;
   prevtime = 0;

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
   int y = 0;
   int counted_bars = prev_calculated;
   if(counted_bars < 0) return(-1);
   if(counted_bars > 0) counted_bars--;
   int limit = (int)MathMin(MathMax(rates_total-counted_bars,2*RSI_Limit_TF/Period()),rates_total-1);

   // Non-repainting: Only process completed bars
   if(limit > 0) limit--;

   double RSI5_up = 0.0, RSI5_dn = 0.0;
   double RSI15_up = 0.0, RSI15_dn = 0.0;
   double RSI60_up = 0.0, RSI60_dn = 0.0;

   for(int i = limit; i > 0; i--)
   {
      bBuffer1[i] = EMPTY_VALUE;
      sBuffer1[i] = EMPTY_VALUE;
      trend[i] = trend[i+1];
      
      y = iBarShift(NULL,PERIOD_M5,time[i]);
      double RSI5_rsi8 = iRSI(NULL,PERIOD_M5,period_RSI5_1,RSI_Price,y);
      double RSI5_rsi4 = iRSI(NULL,PERIOD_M5,period_RSI5_2,RSI_Price,y);
      RSI5_up = (RSI5_rsi4 > RSI5_rsi8) ? 1.0 : 0.0;
      RSI5_dn = (RSI5_rsi4 < RSI5_rsi8) ? 1.0 : 0.0;

      y = iBarShift(NULL,PERIOD_M15,time[i]);
      double RSI15_rsi4 = iRSI(NULL,PERIOD_M15,period_RSI15_1,RSI_Price,y);
      double RSI15_rsi2 = iRSI(NULL,PERIOD_M15,period_RSI15_2,RSI_Price,y);
      RSI15_up = (RSI15_rsi2 > RSI15_rsi4) ? 1.0 : 0.0;
      RSI15_dn = (RSI15_rsi2 < RSI15_rsi4) ? 1.0 : 0.0;

      y = iBarShift(NULL,PERIOD_H1,time[i]);
      double RSI60_rsi4 = iRSI(NULL,PERIOD_H1,period_RSI60_1,RSI_Price,y);
      double RSI60_rsi2 = iRSI(NULL,PERIOD_H1,period_RSI60_2,RSI_Price,y);
      RSI60_up = (RSI60_rsi2 > RSI60_rsi4) ? 1.0 : 0.0;
      RSI60_dn = (RSI60_rsi2 < RSI60_rsi4) ? 1.0 : 0.0;

      // Original logic: trend changes only on complete alignment
      if (RSI5_up == 1.0 && RSI15_up == 1.0 && RSI60_up == 1.0) trend[i] = 1;
      else if (RSI5_dn == 1.0 && RSI15_dn == 1.0 && RSI60_dn == 1.0) trend[i] = -1;
      
      // Draw arrows only on trend flips
      if (trend[i] != trend[i+1])
      {
         if (trend[i] == 1) bBuffer1[i] = low[i] - 5*ArrowUpGap*Point;
         else if (trend[i] == -1) sBuffer1[i] = high[i] + 5*ArrowDnGap*Point;
      }
   } 
   
   // Non-repainting: Only process current bar if it's a new bar
   if(time[0] != LastProcessedTime)
   {
      LastProcessedTime = time[0];
      
      // Process current bar (i=0) only for trend continuation, not for new signals
      bBuffer1[0] = EMPTY_VALUE;
      sBuffer1[0] = EMPTY_VALUE;
      trend[0] = trend[1];
      
      y = iBarShift(NULL,PERIOD_M5,time[0]);
      double RSI5_rsi8 = iRSI(NULL,PERIOD_M5,period_RSI5_1,RSI_Price,y);
      double RSI5_rsi4 = iRSI(NULL,PERIOD_M5,period_RSI5_2,RSI_Price,y);
      RSI5_up = (RSI5_rsi4 > RSI5_rsi8) ? 1.0 : 0.0;
      RSI5_dn = (RSI5_rsi4 < RSI5_rsi8) ? 1.0 : 0.0;

      y = iBarShift(NULL,PERIOD_M15,time[0]);
      double RSI15_rsi4 = iRSI(NULL,PERIOD_M15,period_RSI15_1,RSI_Price,y);
      double RSI15_rsi2 = iRSI(NULL,PERIOD_M15,period_RSI15_2,RSI_Price,y);
      RSI15_up = (RSI15_rsi2 > RSI15_rsi4) ? 1.0 : 0.0;
      RSI15_dn = (RSI15_rsi2 < RSI15_rsi4) ? 1.0 : 0.0;

      y = iBarShift(NULL,PERIOD_H1,time[0]);
      double RSI60_rsi4 = iRSI(NULL,PERIOD_H1,period_RSI60_1,RSI_Price,y);
      double RSI60_rsi2 = iRSI(NULL,PERIOD_H1,period_RSI60_2,RSI_Price,y);
      RSI60_up = (RSI60_rsi2 > RSI60_rsi4) ? 1.0 : 0.0;
      RSI60_dn = (RSI60_rsi2 < RSI60_rsi4) ? 1.0 : 0.0;

      if (RSI5_up == 1.0 && RSI15_up == 1.0 && RSI60_up == 1.0) trend[0] = 1;
      else if (RSI5_dn == 1.0 && RSI15_dn == 1.0 && RSI60_dn == 1.0) trend[0] = -1;
   }
   
   if(time[0] == prevtime) 
       return(0);
   prevtime = time[0];  
  
//-------------------------------------------------------------------+ 
   if(AlertsMessage || AlertsSound || AlertsEmail || AlertsMobile)
   { 
      string message1 = StringConcatenate(Symbol(), " M", Period()," ", " ARROW DIAMOND RSI : BUY!");
      string message2 = StringConcatenate(Symbol(), " M", Period()," ", " ARROW DIAMOND RSI : SELL!");
       
      if(TimeBar != time[0] && bBuffer1[SIGNAL_BAR] != EMPTY_VALUE && bBuffer1[SIGNAL_BAR+1] == EMPTY_VALUE)
      { 
         if (AlertsMessage) Alert(message1);
         if (AlertsSound)   PlaySound("alert2.wav");
         if (AlertsEmail)   SendMail(Symbol()+" - "+WindowExpertName()+" - ",message1);
         if (AlertsMobile)  SendNotification(message1);
         TimeBar = time[0];
      }
      
      if(TimeBar != time[0] && sBuffer1[SIGNAL_BAR] != EMPTY_VALUE && sBuffer1[SIGNAL_BAR+1] == EMPTY_VALUE)
      { 
         if (AlertsMessage) Alert(message2);
         if (AlertsSound)   PlaySound("alert2.wav");
         if (AlertsEmail)   SendMail(Symbol()+" - "+WindowExpertName()+" - ",message2);
         if (AlertsMobile)  SendNotification(message2);
         TimeBar = time[0];
      }
   }
//-------------------------------------------------------------------+  
   return(0);
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
      case PERIOD_MN1: return("MN1");
      default:         return("P"+IntegerToString(Period()));
   }
} 