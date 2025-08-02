//+------------------------------------------------------------------+
//|                                            ARROW DIAMOND RSI.mq4 |
//|                                                     Saasa Ivanov |
//|                                          https://saasa.jimdo.com |
//+------------------------------------------------------------------+
#property copyright "Saasa Ivanov"
#property link      "https://saasa.jimdo.com"
#property strict

#property indicator_chart_window
#property indicator_buffers 1
#property indicator_color1 Red
#property indicator_width1 3
//=============================
enum MYENUM
 { 
   Var0,
   Var1 
 }; 
//============================ 
//---- input parameters
extern ENUM_TIMEFRAMES RSI_Limit_TF = PERIOD_CURRENT;
extern ENUM_APPLIED_PRICE RSI_Price = PRICE_CLOSE;
extern int period_RSI5_1 = 30;
extern int period_RSI5_2 = 10;
extern int period_RSI15_1 = 30;
extern int period_RSI15_2 = 10;
extern int period_RSI60_1 = 14;
extern int period_RSI60_2 = 7;
extern color ArrowsDnColor = Red;
extern int ArrowsDnCode = 242;
extern int ArrowsSize = 2;
extern double ArrowDnGap = 3.0;
extern bool Arrows = true;
extern bool AlertsMessage = true; 
extern bool AlertsSound = false;
extern bool AlertsEmail = false;
extern bool AlertsMobile = false;
extern MYENUM SIGNAL_BAR = Var0;  

datetime TimeBar;
datetime LastProcessedTime;

double sBuffer1[];
double trend[];
int prevtime;
//--------------------------------------------------------------------------------------
//
//--------------------------------------------------------------------------------------
int OnInit()
  {
//--- indicator buffers mapping
   IndicatorBuffers(2);
   SetIndexStyle(0, DRAW_ARROW, EMPTY,ArrowsSize,ArrowsDnColor);
   SetIndexArrow(0, ArrowsDnCode);
   SetIndexDrawBegin(0,0.0);
   SetIndexLabel(0,NULL);
   SetIndexBuffer(0,sBuffer1);
   SetIndexBuffer(1,trend);
   
   // Initialize arrays - completely clear any old signals
   ArrayInitialize(sBuffer1, EMPTY_VALUE);
   ArrayInitialize(trend, 0);
   
   // Reset time tracking variables
   TimeBar = 0;
   LastProcessedTime = 0;
   prevtime = 0;
   
   return(INIT_SUCCEEDED);
  }
//--------------------------------------------------------------------------------------
//
//--------------------------------------------------------------------------------------
//
//
//
//

int start()
{
   int y = 0;
   int counted_bars = IndicatorCounted();
   if(counted_bars < 0) return(-1);
   if(counted_bars > 0) counted_bars--;
   int limit = (int)MathMin(MathMax(Bars-counted_bars,2*RSI_Limit_TF/Period()),Bars-1);

   // Non-repainting: Only process completed bars
   if(limit > 0) limit--;

   //
   //
   //
   //
   //

       double RSI5_dn = 0.0;
    double RSI15_dn = 0.0;
    double RSI60_dn = 0.0;

    for(int i = limit; i > 0; i--)
    {
          sBuffer1[i] = EMPTY_VALUE;
          trend[i] = trend[i+1];
          
          y = iBarShift(NULL,PERIOD_M5,Time[i]);
          double RSI5_rsi8 = iRSI(NULL,PERIOD_M5,period_RSI5_1,RSI_Price,y);
          double RSI5_rsi4 = iRSI(NULL,PERIOD_M5,period_RSI5_2,RSI_Price,y);
          RSI5_dn = (RSI5_rsi4 < RSI5_rsi8) ? 1.0 : 0.0;

          y = iBarShift(NULL,PERIOD_M15,Time[i]);
          double RSI15_rsi4 = iRSI(NULL,PERIOD_M15,period_RSI15_1,RSI_Price,y);
          double RSI15_rsi2 = iRSI(NULL,PERIOD_M15,period_RSI15_2,RSI_Price,y);
          RSI15_dn = (RSI15_rsi2 < RSI15_rsi4) ? 1.0 : 0.0;

          y = iBarShift(NULL,PERIOD_H1,Time[i]);
          double RSI60_rsi4 = iRSI(NULL,PERIOD_H1,period_RSI60_1,RSI_Price,y);
          double RSI60_rsi2 = iRSI(NULL,PERIOD_H1, period_RSI60_2,RSI_Price,y);
          RSI60_dn = (RSI60_rsi2 < RSI60_rsi4) ? 1.0 : 0.0;  

               //
               //
               //
               //
               //
               
                               if (RSI5_dn == 1.0 && RSI15_dn == 1.0 && RSI60_dn == 1.0) trend[i] = -1;
                if (trend[i] != trend[i+1])
                {
                   if (trend[i] == -1) sBuffer1[i] = High[i] + 5*ArrowDnGap*Point;
                }
   } 
   
   // Non-repainting: Only process current bar if it's a new bar
   if(Time[0] != LastProcessedTime)
   {
      LastProcessedTime = Time[0];
      
      // Process current bar (i=0) only for trend continuation, not for new signals
      sBuffer1[0] = EMPTY_VALUE;
      trend[0] = trend[1];
      
             y = iBarShift(NULL,PERIOD_M5,Time[0]);
       double RSI5_rsi8 = iRSI(NULL,PERIOD_M5,period_RSI5_1,RSI_Price,y);
       double RSI5_rsi4 = iRSI(NULL,PERIOD_M5,period_RSI5_2,RSI_Price,y);
       RSI5_dn = (RSI5_rsi4 < RSI5_rsi8) ? 1.0 : 0.0;

       y = iBarShift(NULL,PERIOD_M15,Time[0]);
       double RSI15_rsi4 = iRSI(NULL,PERIOD_M15,period_RSI15_1,RSI_Price,y);
       double RSI15_rsi2 = iRSI(NULL,PERIOD_M15,period_RSI15_2,RSI_Price,y);
       RSI15_dn = (RSI15_rsi2 < RSI15_rsi4) ? 1.0 : 0.0;

       y = iBarShift(NULL,PERIOD_H1,Time[0]);
       double RSI60_rsi4 = iRSI(NULL,PERIOD_H1,period_RSI60_1,RSI_Price,y);
       double RSI60_rsi2 = iRSI(NULL,PERIOD_H1, period_RSI60_2,RSI_Price,y);
       RSI60_dn = (RSI60_rsi2 < RSI60_rsi4) ? 1.0 : 0.0;

       if (RSI5_dn == 1.0 && RSI15_dn == 1.0 && RSI60_dn == 1.0) trend[0] = -1;
   }
   
   if(Time[0] == prevtime) 
       return(0);
   prevtime = Time[0];  
    // Removed empty if statements that were causing warnings 
  
//-------------------------------------------------------------------+ 
 if(AlertsMessage || AlertsSound || AlertsEmail || AlertsMobile)
  { 
      string message2 = StringConcatenate(Symbol(), " M", Period()," ", " ARROW DIAMOND RSI : SELL!");
       
    if(TimeBar != Time[0] && sBuffer1[SIGNAL_BAR] != EMPTY_VALUE && sBuffer1[SIGNAL_BAR+1] == EMPTY_VALUE)
     { 
        if (AlertsMessage) Alert(message2);
        if (AlertsSound)   PlaySound("alert2.wav");
        if (AlertsEmail)   SendMail(Symbol()+" - "+WindowExpertName()+" - ",message2);
        if (AlertsMobile)  SendNotification(message2);
        TimeBar = Time[0];
     }
  }
//-------------------------------------------------------------------+  
   return(0);
}
//-------------------------------------------------------------------+ 
string PeriodString()
{
    switch (Period()) 
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
        default:         return("M" + IntegerToString(Period()));
     }    
} 