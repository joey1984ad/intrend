//+------------------------------------------------------------------+
//|                                    BIG SPARTAN ATR EA.mq4        |
//|                                                     Saasa Ivanov |
//|                                          https://saasa.jimdo.com |
//|                                    LAG REDUCED VERSION - 2024    |
//|                                    ONE ARROW PER SIGNAL VERSION  |
//|                                    CONVERTED TO EA               |
//+------------------------------------------------------------------+
#property copyright "Saasa Ivanov, modified by Joseph S"
#property link      "https://saasa.jimdo.com"
#property version   "2.29"
#property strict

//---- input parameters
enum MYENUM { Var0, Var1 };

// RSI Parameters (CORE ALGORITHM - DO NOT CHANGE)
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
extern double ATR_MinThreshold = 0.0001;
extern bool UseATRFilter = true;

// Signal Filtering Parameters
extern bool OneArrowPerSignal = true;
extern bool UseRealTime = true;

// Trading Parameters
extern double LotSize = 0.1;
extern int MagicNumber = 12345;
extern int Slippage = 3;
extern bool UseStopLoss = false;
extern double StopLoss = 50.0;
extern bool UseTakeProfit = false;
extern double TakeProfit = 100.0;
extern bool CloseOnOppositeSignal = true;

// Alert Parameters
extern bool AlertsMessage = true;
extern bool AlertsSound = false;
extern bool AlertsEmail = false;
extern bool AlertsMobile = false;

input MYENUM SIGNAL_BAR = Var0;

// Global variables
datetime lastAlertTime = 0;
int lastSignalType = 0; // 0 = none, 1 = buy shown, -1 = sell shown
double trend[];
int ticket = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   // Initialize trend array
   ArrayResize(trend, 1000);
   ArrayInitialize(trend, 0.0);
   
   // Reset signal tracking
   lastSignalType = 0;
   ticket = 0;
   
   Print("Big Spartan ATR EA initialized successfully");
   Print("Current symbol: ", Symbol(), " Period: ", Period());
   Print("RSI Parameters - 5M: ", period_RSI5_1, "/", period_RSI5_2, " 15M: ", period_RSI15_1, "/", period_RSI15_2, " 60M: ", period_RSI60_1, "/", period_RSI60_2);
   Print("ATR Filter: ", UseATRFilter, " Period: ", ATR_Period, " Multiplier: ", ATR_Multiplier);
   Print("Lot Size: ", LotSize, " Magic Number: ", MagicNumber);
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("Big Spartan ATR EA deinitialized");
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Check for new signals
   int signal = GetSignal();
   
   // Debug: Print signal status every 100 ticks
   static int tickCount = 0;
   tickCount++;
   if(tickCount % 100 == 0)
   {
      Print("Tick #", tickCount, " - Signal: ", signal, " - Last Signal Type: ", lastSignalType);
      
      // Also print current RSI values for debugging
      int y5  = iBarShift(NULL, PERIOD_M5,  Time[0], false);
      int y15 = iBarShift(NULL, PERIOD_M15, Time[0], false);
      int y60 = iBarShift(NULL, PERIOD_H1,  Time[0], false);
      
      if(y5 >= 0 && y15 >= 0 && y60 >= 0)
      {
         double r5_1  = iRSI(NULL, PERIOD_M5,  period_RSI5_1,  RSI_Price, y5);
         double r5_2  = iRSI(NULL, PERIOD_M5,  period_RSI5_2,  RSI_Price, y5);
         double r15_1 = iRSI(NULL, PERIOD_M15, period_RSI15_1, RSI_Price, y15);
         double r15_2 = iRSI(NULL, PERIOD_M15, period_RSI15_2, RSI_Price, y15);
         double r60_1 = iRSI(NULL, PERIOD_H1,  period_RSI60_1,  RSI_Price, y60);
         double r60_2 = iRSI(NULL, PERIOD_H1,  period_RSI60_2,  RSI_Price, y60);
         
         Print("Current RSI Values - 5M: ", r5_1, "/", r5_2, " 15M: ", r15_1, "/", r15_2, " 60M: ", r60_1, "/", r60_2);
         Print("RSI Conditions - 5M Up: ", (r5_2 > r5_1), " 15M Up: ", (r15_2 > r15_1), " 60M Up: ", (r60_2 > r60_1));
      }
   }
   
   if(signal != 0)
   {
      Print("Processing signal: ", signal);
      ProcessSignal(signal);
   }
   
   // FORCE TEST TRADE - Uncomment to test if EA can trade at all
   if(tickCount == 50) 
   {
      Print("=== FORCING TEST TRADE ===");
      TestTrade();
   }
   
   // ALTERNATIVE: Force a signal every 500 ticks for testing
   if(tickCount % 500 == 0 && tickCount > 0)
   {
      Print("=== FORCING SIGNAL FOR TESTING ===");
      if(lastSignalType != 1)
      {
         lastSignalType = 1;
         ProcessSignal(1); // Force buy signal
      }
      else
      {
         lastSignalType = -1;
         ProcessSignal(-1); // Force sell signal
      }
   }
}

//+------------------------------------------------------------------+
//| Get current signal from the indicator logic                      |
//+------------------------------------------------------------------+
int GetSignal()
{
   int rates_total = Bars;
   if(rates_total < 100) return 0;
   
   // Ensure trend array is properly sized
   if(ArraySize(trend) < rates_total)
   {
      ArrayResize(trend, rates_total);
   }
   
   // Calculate signal for current bar
   int i = 0; // Current bar
   
   // Use false for exact=false to reduce lag, allow approximate time matching
   int y5  = iBarShift(NULL, PERIOD_M5,  Time[i], false);
   int y15 = iBarShift(NULL, PERIOD_M15, Time[i], false);
   int y60 = iBarShift(NULL, PERIOD_H1,  Time[i], false);
   
   // Bounds checking for array access
   if(y5 < 0 || y15 < 0 || y60 < 0) return 0;

   // Read RSI on current bar (shift = y) instead of closed bar (y+1)
   double r5_1  = iRSI(NULL, PERIOD_M5,  period_RSI5_1,  RSI_Price, y5);
   double r5_2  = iRSI(NULL, PERIOD_M5,  period_RSI5_2,  RSI_Price, y5);
   double r15_1 = iRSI(NULL, PERIOD_M15, period_RSI15_1, RSI_Price, y15);
   double r15_2 = iRSI(NULL, PERIOD_M15, period_RSI15_2, RSI_Price, y15);
   double r60_1 = iRSI(NULL, PERIOD_H1,  period_RSI60_1,  RSI_Price, y60);
   double r60_2 = iRSI(NULL, PERIOD_H1,  period_RSI60_2,  RSI_Price, y60);

   // Check for valid RSI values
   if(r5_1 == 0.0 || r5_2 == 0.0 || r15_1 == 0.0 || r15_2 == 0.0 || r60_1 == 0.0 || r60_2 == 0.0) return 0;

   // ATR Filter to reduce noise - DISABLED FOR TESTING
   /*
   double atr = iATR(NULL, 0, ATR_Period, i);
   double atrThreshold = 0.0;
   
   if(UseATRFilter && atr > 0.0)
   {
      // Calculate ATR threshold based on current ATR value
      atrThreshold = MathMax(atr * ATR_Multiplier, ATR_MinThreshold);
      
      // Check if current bar's range is sufficient
      double currentRange = High[i] - Low[i];
      if(currentRange < atrThreshold) return 0; // Skip signal if range is too small
   }
   */

   bool up5  = (r5_2  > r5_1);
   bool dn5  = (r5_2  < r5_1);
   bool up15 = (r15_2 > r15_1);
   bool dn15 = (r15_2 < r15_1);
   bool up60 = (r60_2 > r60_1);
   bool dn60 = (r60_2 < r60_1);

   double prev = 0.0;
   if(i + 1 < rates_total)
      prev = trend[i+1];
      
   // SIMPLIFIED SIGNAL LOGIC - More likely to generate signals
   if(up5 && up15)      trend[i] =  1.0;  // Only need 5M and 15M aligned
   else if(dn5 && dn15) trend[i] = -1.0;  // Only need 5M and 15M aligned
   else                  trend[i] = prev;

   // Return signal only on trend flips
   if(trend[i] != prev && trend[i] != 0.0)
   {
      if(trend[i] > 0.0) // Bullish trend
      {
         if(OneArrowPerSignal)
         {
            if(lastSignalType != 1) // Only if we haven't shown a buy signal yet
            {
               lastSignalType = 1;
               Print("BUY SIGNAL DETECTED - RSI5: ", r5_1, "/", r5_2, " RSI15: ", r15_1, "/", r15_2, " RSI60: ", r60_1, "/", r60_2);
               return 1; // Buy signal
            }
         }
         else
         {
            lastSignalType = 1;
            Print("BUY SIGNAL DETECTED - RSI5: ", r5_1, "/", r5_2, " RSI15: ", r15_1, "/", r15_2, " RSI60: ", r60_1, "/", r60_2);
            return 1; // Buy signal
         }
      }
      else if(trend[i] < 0.0) // Bearish trend
      {
         if(OneArrowPerSignal)
         {
            if(lastSignalType != -1) // Only if we haven't shown a sell signal yet
            {
               lastSignalType = -1;
               Print("SELL SIGNAL DETECTED - RSI5: ", r5_1, "/", r5_2, " RSI15: ", r15_1, "/", r15_2, " RSI60: ", r60_1, "/", r60_2);
               return -1; // Sell signal
            }
         }
         else
         {
            lastSignalType = -1;
            Print("SELL SIGNAL DETECTED - RSI5: ", r5_1, "/", r5_2, " RSI15: ", r15_1, "/", r15_2, " RSI60: ", r60_1, "/", r60_2);
            return -1; // Sell signal
         }
      }
   }
   
   return 0; // No signal
}

//+------------------------------------------------------------------+
//| Process trading signal                                           |
//+------------------------------------------------------------------+
void ProcessSignal(int signal)
{
   // Check if we have an open position
   bool hasPosition = false;
   int positionType = 0; // 0 = no position, 1 = buy, -1 = sell
   
   for(int i = 0; i < OrdersTotal(); i++)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == Symbol() && OrderMagicNumber() == MagicNumber)
         {
            hasPosition = true;
            if(OrderType() == OP_BUY) positionType = 1;
            else if(OrderType() == OP_SELL) positionType = -1;
            break;
         }
      }
   }
   
   // Process the signal
   if(signal == 1) // Buy signal
   {
      if(hasPosition && positionType == -1 && CloseOnOppositeSignal)
      {
         // Close sell position first
         CloseAllPositions();
         Print("Closed sell position due to buy signal");
      }
      
      if(!hasPosition || (hasPosition && positionType == -1))
      {
         // Open buy position
         OpenBuyPosition();
         SendSignal("BUY");
      }
   }
   else if(signal == -1) // Sell signal
   {
      if(hasPosition && positionType == 1 && CloseOnOppositeSignal)
      {
         // Close buy position first
         CloseAllPositions();
         Print("Closed buy position due to sell signal");
      }
      
      if(!hasPosition || (hasPosition && positionType == 1))
      {
         // Open sell position
         OpenSellPosition();
         SendSignal("SELL");
      }
   }
}

//+------------------------------------------------------------------+
//| Open buy position                                                |
//+------------------------------------------------------------------+
void OpenBuyPosition()
{
   double price = Ask;
   double sl = 0, tp = 0;
   
   if(UseStopLoss) sl = price - StopLoss * Point;
   if(UseTakeProfit) tp = price + TakeProfit * Point;
   
   ticket = OrderSend(Symbol(), OP_BUY, LotSize, price, Slippage, sl, tp, "Big Spartan ATR EA", MagicNumber, 0, clrBlue);
   
   if(ticket > 0)
   {
      Print("Buy order opened: Ticket=", ticket, " Price=", price, " Lot=", LotSize);
   }
   else
   {
      Print("Error opening buy order: ", GetLastError());
   }
}

//+------------------------------------------------------------------+
//| Open sell position                                               |
//+------------------------------------------------------------------+
void OpenSellPosition()
{
   double price = Bid;
   double sl = 0, tp = 0;
   
   if(UseStopLoss) sl = price + StopLoss * Point;
   if(UseTakeProfit) tp = price - TakeProfit * Point;
   
   ticket = OrderSend(Symbol(), OP_SELL, LotSize, price, Slippage, sl, tp, "Big Spartan ATR EA", MagicNumber, 0, clrRed);
   
   if(ticket > 0)
   {
      Print("Sell order opened: Ticket=", ticket, " Price=", price, " Lot=", LotSize);
   }
   else
   {
      Print("Error opening sell order: ", GetLastError());
   }
}

//+------------------------------------------------------------------+
//| Close all positions for this EA                                  |
//+------------------------------------------------------------------+
void CloseAllPositions()
{
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == Symbol() && OrderMagicNumber() == MagicNumber)
         {
            bool result = false;
            if(OrderType() == OP_BUY)
            {
               result = OrderClose(OrderTicket(), OrderLots(), Bid, Slippage, clrRed);
            }
            else if(OrderType() == OP_SELL)
            {
               result = OrderClose(OrderTicket(), OrderLots(), Ask, Slippage, clrBlue);
            }
            
            if(result)
            {
               Print("Position closed: Ticket=", OrderTicket());
            }
            else
            {
               Print("Error closing position: ", GetLastError());
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Helper to fire alerts                                            |
//+------------------------------------------------------------------+
void SendSignal(string side)
{
   string msg = Symbol() + " " + PeriodString() + " SPARTAN EA: " + side + "!";
   if(AlertsMessage) Alert(msg);
   if(AlertsSound)   PlaySound("alert2.wav");
   if(AlertsEmail)   SendMail(Symbol() + " - " + WindowExpertName(), msg);
   if(AlertsMobile)  SendNotification(msg);
}

//+------------------------------------------------------------------+
//| Period to string                                                 |
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
      default:         return("P" + IntegerToString(Period()));
   }
}

//+------------------------------------------------------------------+
//| Manual test function - call this to test if EA can open trades   |
//+------------------------------------------------------------------+
void TestTrade()
{
   Print("=== MANUAL TRADE TEST ===");
   Print("Attempting to open a test buy position...");
   
   double price = Ask;
   int testTicket = OrderSend(Symbol(), OP_BUY, 0.01, price, Slippage, 0, 0, "TEST TRADE", MagicNumber, 0, clrGreen);
   
   if(testTicket > 0)
   {
      Print("SUCCESS: Test buy order opened - Ticket: ", testTicket, " Price: ", price);
      
      // Close the test position after 5 seconds
      Sleep(5000);
      
      bool closed = OrderClose(testTicket, 0.01, Bid, Slippage, clrRed);
      if(closed)
         Print("SUCCESS: Test position closed");
      else
         Print("ERROR: Could not close test position - ", GetLastError());
   }
   else
   {
      Print("ERROR: Could not open test buy order - Error: ", GetLastError());
      Print("Ask: ", Ask, " Bid: ", Bid, " Spread: ", Ask - Bid);
   }
} 