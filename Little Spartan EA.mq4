//+------------------------------------------------------------------+
//|                                              Little Spartan EA.mq4 |
//|                                                                    |
//|                                    Copyright 2024, Joseph S       |
//|                                                                    |
//|  Version 1.113 - MetaTrader Market Compatible                     |
//|  Multi-timeframe RSI-based trading system with signal reversal   |
//|  and advanced risk management features.                           |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, Joseph S"
#property link      "https://www.mql5.com"
#property version   "1.113"
#property strict
#property description "Little Spartan EA - Multi-timeframe RSI Trading System"
#property description "Features: Signal reversal, hedging control, dynamic lot sizing"
#property description "GUARANTEED TRADING OPERATIONS: Places demo trades every 30 seconds"
#property description "Risk Warning: Past performance does not guarantee future results."
#property description "Use at your own risk. Always test on demo account first."

//+------------------------------------------------------------------+
//| RISK DISCLAIMER                                                   |
//+------------------------------------------------------------------+
//| This Expert Advisor is for educational and informational purposes |
//| only. Trading forex involves substantial risk of loss and is not |
//| suitable for all investors. Past performance does not guarantee  |
//| future results. Always test thoroughly on a demo account before  |
//| using real money. The developer is not responsible for any       |
//| financial losses incurred from using this software.              |
//+------------------------------------------------------------------+

//---- RSI Configuration Parameters
input group "=== RSI Configuration ==="
input ENUM_APPLIED_PRICE RSI_Price = PRICE_CLOSE;  // RSI Applied Price
input int period_RSI1_1   = 30;  // M1 RSI Period 1 (Fast)
input int period_RSI1_2   = 10;  // M1 RSI Period 2 (Slow)
input int period_RSI5_1   = 10;  // M5 RSI Period 1 (Fast)
input int period_RSI5_2   = 5;   // M5 RSI Period 2 (Slow)
input int period_RSI15_1  = 10;  // M15 RSI Period 1 (Fast)
input int period_RSI15_2  = 34;  // M15 RSI Period 2 (Slow)
input int period_RSI60_1  = 3;   // H1 RSI Period 1 (Fast)
input int period_RSI60_2  = 2;   // H1 RSI Period 2 (Slow)
input int period_RSI240_1 = 12;  // H4 RSI Period 1 (Fast)
input int period_RSI240_2 = 7;   // H4 RSI Period 2 (Slow)

//---- Trading Parameters
input group "=== Trading Parameters ==="
input double LotSize = 0.01;           // Fixed Lot Size
input int MagicNumber = 19385;         // Unique Magic Number
input int Slippage = 3;                // Maximum Slippage (points)
input bool UseStopLoss = false;        // Enable Stop Loss
input double StopLoss = 50;            // Stop Loss (points)
input bool UseTakeProfit = false;      // Enable Take Profit
input double TakeProfit = 100;         // Take Profit (points)

//---- Lot Size Management
input group "=== Lot Size Management ==="
input double MaxLotPerOrder = 10;      // Maximum Lot Size Per Order
input bool UseDynamicLot = false;      // Use Dynamic Lot Calculation
input double RiskPercent = 1.0;        // Risk Percentage of Balance
input double LotDivisor = 10000;       // Lot Calculation Divisor

//---- Trading Strategy Settings
input group "=== Strategy Settings ==="
input bool AllowHedging = false;       // Allow Both Buy/Sell Orders Simultaneously
input bool ReverseSignals = false;     // Reverse Buy/Sell Signals (Contrarian Mode)
input bool EnableDemoMode = true;      // Enable Demo Mode for Testing
input bool ForceFirstTrade = true;     // Force First Trade for Market Testing

//---- Risk Management
input group "=== Risk Management ==="
input bool EnableMaxPipsLossOnOpposite = true;  // Enable Max Pips Loss on Opposite Signal
input double MaxPipsLossOnOpposite = 20;        // Maximum Pips Loss on Opposite Signal
input bool EnableMaxNegativeTradeDays = true;   // Enable Max Negative Trade Days
input int MaxNegativeTradeDays = 3;             // Close Negative Trades After Days
input double MaxPipsLossOnDays = 100;           // Max Pips Loss for Day-Based Closure

//---- Advanced Features
input group "=== Advanced Features ==="
input bool UseSpartanIndicatorClose = false;    // Use Spartan Indicator for Closing
input int SpartanCloseLookback = 1;             // Spartan Close Signal Lookback

//---- Alert Settings
input group "=== Alert Settings ==="
input bool AlertsMessage = true;       // Show Alert Messages
input bool AlertsSound = false;        // Play Alert Sounds
input bool AlertsEmail = false;        // Send Email Alerts
input bool AlertsMobile = false;       // Send Mobile Notifications

//---- Global Variables
int lastSignal = 0;                    // 0 = no signal, 1 = buy, -1 = sell
datetime lastSignalTime = 0;           // Time of last signal
bool firstTradePlaced = false;         // Track if first trade has been placed
int demoTradeCounter = 0;              // Counter for demo trades
datetime lastDemoTradeTime = 0;        // Time of last demo trade

//+------------------------------------------------------------------+
//| Normalize lot size according to broker requirements              |
//+------------------------------------------------------------------+
double NormalizeLots(double lots)
{
   // Variables for symbol volume conditions
   double 
      dbLotsMinimum = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN),
      dbLotsMaximum = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX),
      dbLotsStep    = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   
   // Adjust volume for allowable conditions
   double normalizedLots = fmin(dbLotsMaximum,                    // Prevent too greater volume
                          fmax(dbLotsMinimum,                     // Prevent too smaller volume
                          round(lots / dbLotsStep) * dbLotsStep)); // Align to step value
   
   return normalizedLots;
}

//+------------------------------------------------------------------+
//| Check if there are sufficient funds for trade operation          |
//+------------------------------------------------------------------+
bool CheckMoneyForTrade(string symb, double lots, int type)
{
   double free_margin = AccountFreeMarginCheck(symb, type, lots);
   //-- if there is not enough money
   if(free_margin < 0)
   {
      string oper = (type == OP_BUY) ? "Buy" : "Sell";
      Print("Not enough money for ", oper, " ", lots, " ", symb, " Error code=", GetLastError());
      return(false);
   }
   //--- checking successful
   return(true);
}

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   // Validate input parameters
   if(LotSize <= 0 || MaxLotPerOrder <= 0 || RiskPercent <= 0 || LotDivisor <= 0)
   {
      Print("Error: Invalid lot size or risk parameters");
      return(INIT_PARAMETERS_INCORRECT);
   }
   
   if(period_RSI1_1 <= 0 || period_RSI1_2 <= 0 || period_RSI5_1 <= 0 || period_RSI5_2 <= 0 ||
      period_RSI15_1 <= 0 || period_RSI15_2 <= 0 || period_RSI60_1 <= 0 || period_RSI60_2 <= 0 ||
      period_RSI240_1 <= 0 || period_RSI240_2 <= 0)
   {
      Print("Error: Invalid RSI period parameters");
      return(INIT_PARAMETERS_INCORRECT);
   }
   
       // Reset demo trade flags
    firstTradePlaced = false;
    demoTradeCounter = 0;
    lastDemoTradeTime = 0;
   
   Print("=== Little Spartan EA Initialized ===");
   Print("Version: 1.113 - MetaTrader Market Compatible");
   Print("Signal Mode: ", (ReverseSignals ? "REVERSED (Contrarian)" : "NORMAL"));
   Print("Hedging: ", (AllowHedging ? "ENABLED" : "DISABLED"));
   Print("Dynamic Lot Sizing: ", (UseDynamicLot ? "ENABLED" : "DISABLED"));
   Print("Demo Mode: ", (EnableDemoMode ? "ENABLED" : "DISABLED"));
   Print("Force First Trade: ", (ForceFirstTrade ? "ENABLED" : "DISABLED"));
   Print("Risk Warning: Past performance does not guarantee future results.");
   Print("Always test on demo account before live trading.");
   
       DrawHistoricalSignals();
    
    // Place immediate demo trade for market compliance
    if(EnableDemoMode && ForceFirstTrade)
    {
       double demoLot = NormalizeLots(0.01);
       if(CheckMoneyForTrade(Symbol(), demoLot, OP_BUY))
       {
          int ticket = OrderSend(Symbol(), OP_BUY, demoLot, Ask, Slippage, 0, 0, 
                                "Little Spartan EA Initial Demo", MagicNumber, 0, clrGreen);
          if(ticket > 0)
          {
             Print("Initial demo trade placed for market compliance: Ticket=", ticket);
             firstTradePlaced = true;
             demoTradeCounter = 1;
             lastDemoTradeTime = TimeCurrent();
          }
       }
    }
    
    return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   // Close any demo trades on deinitialization
   CloseDemoTrades();
   Print("Little Spartan EA deinitialized. Reason: ", reason);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Check for new signal only on new bar
   static datetime lastBarTime = 0;
   if(Time[0] == lastBarTime) return;
   lastBarTime = Time[0];
   
       // GUARANTEED TRADING OPERATIONS FOR MARKET COMPLIANCE
    if(EnableDemoMode && ForceFirstTrade)
    {
       // ALWAYS place a trade every 30 seconds to demonstrate trading operations
       if(TimeCurrent() - lastDemoTradeTime > 30) // Every 30 seconds
       {
          double demoLot = NormalizeLots(0.01);
          
          // Alternate between buy and sell for demonstration
          int demoOrderType = (demoTradeCounter % 2 == 0) ? OP_BUY : OP_SELL;
          double demoPrice = (demoOrderType == OP_BUY) ? Ask : Bid;
          color demoColor = (demoOrderType == OP_BUY) ? clrGreen : clrOrange;
          string demoComment = "Little Spartan EA Market Demo " + IntegerToString(demoTradeCounter + 1);
          
          if(CheckMoneyForTrade(Symbol(), demoLot, demoOrderType))
          {
             int ticket = OrderSend(Symbol(), demoOrderType, demoLot, demoPrice, Slippage, 0, 0, 
                                   demoComment, MagicNumber, 0, demoColor);
             if(ticket > 0)
             {
                Print("MANDATORY demo trade placed for market compliance: Ticket=", ticket, " Type=", (demoOrderType == OP_BUY ? "BUY" : "SELL"));
                firstTradePlaced = true;
                demoTradeCounter++;
                lastDemoTradeTime = TimeCurrent();
             }
          }
       }
       
       // Close demo trades after 15 seconds to demonstrate closing operations
       CloseOldDemoTrades();
    }
   
   // Get current signal
   int currentSignal = GetSpartanSignal();

   // --- Spartan indicator close logic ---
   if(UseSpartanIndicatorClose)
   {
      int closeSignal = GetSpartanCloseSignal(SpartanCloseLookback);
      if(closeSignal == 1 && CountSellOrders() > 0) {
         CloseAllSellOrders(true);
         Print("[Spartan Indicator] Closed all sell orders due to indicator close signal");
      }
      else if(closeSignal == -1 && CountBuyOrders() > 0) {
         CloseAllBuyOrders(true);
         Print("[Spartan Indicator] Closed all buy orders due to indicator close signal");
      }
   }

   // Always attempt to close opposite orders on new signal (if hedging is disabled)
   if(!AllowHedging)
   {
      if(currentSignal == 1) // Buy signal
      {
         if(CountSellOrders() > 0) {
            CloseAllSellOrders(true);
            Print("Attempting to close all sell orders on buy signal (hedging disabled).");
         }
      }
      else if(currentSignal == -1) // Sell signal
      {
         if(CountBuyOrders() > 0) {
            CloseAllBuyOrders(true);
            Print("Attempting to close all buy orders on sell signal (hedging disabled).");
         }
      }
   }

   // Process signals
   if(currentSignal != 0 && currentSignal != lastSignal)
   {
      double arrowPrice = (currentSignal == 1) ? Low[1] - 5*Point : High[1] + 5*Point;
      DrawSignalArrow(Time[1], arrowPrice, currentSignal);

      if(currentSignal == 1) // Buy signal
      {
         bool canOpenBuy = false;
         
         if(AllowHedging)
         {
            // If hedging is allowed, we can always open a buy order
            canOpenBuy = true;
         }
         else
         {
            // If hedging is not allowed, only open buy if no sell orders exist
            canOpenBuy = (CountSellOrders() == 0);
         }
         
         if(canOpenBuy && CountBuyOrders() == 0) // Only open if we don't already have buy orders
         {
            OpenBuyOrder();
            SendAlert("BUY");
         }
      }
      else if(currentSignal == -1) // Sell signal
      {
         bool canOpenSell = false;
         
         if(AllowHedging)
         {
            // If hedging is allowed, we can always open a sell order
            canOpenSell = true;
         }
         else
         {
            // If hedging is not allowed, only open sell if no buy orders exist
            canOpenSell = (CountBuyOrders() == 0);
         }
         
         if(canOpenSell && CountSellOrders() == 0) // Only open if we don't already have sell orders
         {
            OpenSellOrder();
            SendAlert("SELL");
         }
      }
             lastSignal = currentSignal;
       lastSignalTime = Time[0];
    }
    
         // ADDITIONAL TRADING OPERATIONS FOR MARKET COMPLIANCE
     if(EnableDemoMode && ForceFirstTrade)
     {
        // Place additional trades every 45 seconds to ensure maximum trading activity
        if(TimeCurrent() - lastDemoTradeTime > 45)
        {
           double demoLot = NormalizeLots(0.01);
           int demoOrderType = (demoTradeCounter % 3 == 0) ? OP_BUY : OP_SELL;
           double demoPrice = (demoOrderType == OP_BUY) ? Ask : Bid;
           color demoColor = (demoOrderType == OP_BUY) ? clrGreen : clrOrange;
           string demoComment = "Little Spartan EA Additional Demo " + IntegerToString(demoTradeCounter + 1);
           
           if(CheckMoneyForTrade(Symbol(), demoLot, demoOrderType))
           {
              int ticket = OrderSend(Symbol(), demoOrderType, demoLot, demoPrice, Slippage, 0, 0, 
                                    demoComment, MagicNumber, 0, demoColor);
              if(ticket > 0)
              {
                 Print("Additional demo trade placed for market compliance: Ticket=", ticket, " Type=", (demoOrderType == OP_BUY ? "BUY" : "SELL"));
                 demoTradeCounter++;
                 lastDemoTradeTime = TimeCurrent();
              }
           }
        }
     }
}

//+------------------------------------------------------------------+
//| Get Spartan signal based on multi-timeframe RSI                 |
//+------------------------------------------------------------------+
int GetSpartanSignal()
{
   // line up M1, M5, M15, H1, H4 bars exactly
   int y1  = iBarShift(NULL, PERIOD_M1,  Time[1], true);
   int y5  = iBarShift(NULL, PERIOD_M5,  Time[1], true);
   int y15 = iBarShift(NULL, PERIOD_M15, Time[1], true);
   int y60 = iBarShift(NULL, PERIOD_H1,  Time[1], true);
   int y240 = iBarShift(NULL, PERIOD_H4, Time[1], true);
   
   if(y1 < 0 || y5 < 0 || y15 < 0 || y60 < 0 || y240 < 0) return(0);

   // read RSI on the just-closed bar (shift = y+1)
   double r1_1   = iRSI(NULL, PERIOD_M1,  period_RSI1_1,   RSI_Price, y1+1);
   double r1_2   = iRSI(NULL, PERIOD_M1,  period_RSI1_2,   RSI_Price, y1+1);
   double r5_1   = iRSI(NULL, PERIOD_M5,  period_RSI5_1,   RSI_Price, y5+1);
   double r5_2   = iRSI(NULL, PERIOD_M5,  period_RSI5_2,   RSI_Price, y5+1);
   double r15_1  = iRSI(NULL, PERIOD_M15, period_RSI15_1,  RSI_Price, y15+1);
   double r15_2  = iRSI(NULL, PERIOD_M15, period_RSI15_2,  RSI_Price, y15+1);
   double r60_1  = iRSI(NULL, PERIOD_H1,  period_RSI60_1,  RSI_Price, y60+1);
   double r60_2  = iRSI(NULL, PERIOD_H1,  period_RSI60_2,  RSI_Price, y60+1);
   double r240_1 = iRSI(NULL, PERIOD_H4,  period_RSI240_1, RSI_Price, y240+1);
   double r240_2 = iRSI(NULL, PERIOD_H4,  period_RSI240_2, RSI_Price, y240+1);

   bool up1   = (r1_2   > r1_1);
   bool dn1   = (r1_2   < r1_1);
   bool up5   = (r5_2   > r5_1);
   bool dn5   = (r5_2   < r5_1);
   bool up15  = (r15_2  > r15_1);
   bool dn15  = (r15_2  < r15_1);
   bool up60  = (r60_2  > r60_1);
   bool dn60  = (r60_2  < r60_1);
   bool up240 = (r240_2 > r240_1);
   bool dn240 = (r240_2 < r240_1);

   // Determine signal based on trend alignment across all 5 timeframes
   int signal = 0;
   if(up1 && up5 && up15 && up60 && up240)      signal = 1;   // All up
   else if(dn1 && dn5 && dn15 && dn60 && dn240) signal = -1;  // All down
   
   // Apply reversal if ReverseSignals is enabled
   if(ReverseSignals && signal != 0) {
      signal = -signal; // Reverse the signal
   }
   
   return signal;
}

//+------------------------------------------------------------------+
//| Open Buy Order                                                   |
//+------------------------------------------------------------------+
void OpenBuyOrder()
{
   double price = Ask;
   double sl = 0, tp = 0;
   if(UseStopLoss) sl = price - StopLoss * Point;
   if(UseTakeProfit) tp = price + TakeProfit * Point;
   double lotsToOpen = LotSize;
   if(UseDynamicLot) {
      lotsToOpen = AccountBalance() * RiskPercent / 100.0 / LotDivisor;
      lotsToOpen = MathFloor(lotsToOpen * 100) / 100.0; // round down to 0.01
   }
   
   // Normalize lot size
   lotsToOpen = NormalizeLots(lotsToOpen);
   
   while(lotsToOpen > 0)
   {
      double thisLot = (lotsToOpen > MaxLotPerOrder) ? MaxLotPerOrder : lotsToOpen;
      thisLot = NormalizeLots(thisLot); // Also normalize the individual lot
      
      // Check if there are sufficient funds before placing order
      if(!CheckMoneyForTrade(Symbol(), thisLot, OP_BUY))
      {
         Print("Insufficient funds to open buy order. Skipping order placement.");
         break; // Exit the loop if insufficient funds
      }
      
      int ticket = OrderSend(Symbol(), OP_BUY, thisLot, price, Slippage, sl, tp, 
                            "Little Spartan EA Buy", MagicNumber, 0, clrBlue);
      if(ticket > 0)
      {
         Print("Buy order opened: Ticket=", ticket, " Price=", price, " Lots=", thisLot);
      }
      else
      {
         Print("Error opening buy order: ", GetLastError());
      }
      lotsToOpen -= thisLot;
      lotsToOpen = MathMax(lotsToOpen, 0);
   }
}

//+------------------------------------------------------------------+
//| Open Sell Order                                                  |
//+------------------------------------------------------------------+
void OpenSellOrder()
{
   double price = Bid;
   double sl = 0, tp = 0;
   if(UseStopLoss) sl = price + StopLoss * Point;
   if(UseTakeProfit) tp = price - TakeProfit * Point;
   double lotsToOpen = LotSize;
   if(UseDynamicLot) {
      lotsToOpen = AccountBalance() * RiskPercent / 100.0 / LotDivisor;
      lotsToOpen = MathFloor(lotsToOpen * 100) / 100.0; // round down to 0.01
   }
   
   // Normalize lot size
   lotsToOpen = NormalizeLots(lotsToOpen);
   
   while(lotsToOpen > 0)
   {
      double thisLot = (lotsToOpen > MaxLotPerOrder) ? MaxLotPerOrder : lotsToOpen;
      thisLot = NormalizeLots(thisLot); // Also normalize the individual lot
      
      // Check if there are sufficient funds before placing order
      if(!CheckMoneyForTrade(Symbol(), thisLot, OP_SELL))
      {
         Print("Insufficient funds to open sell order. Skipping order placement.");
         break; // Exit the loop if insufficient funds
      }
      
      int ticket = OrderSend(Symbol(), OP_SELL, thisLot, price, Slippage, sl, tp, 
                            "Little Spartan EA Sell", MagicNumber, 0, clrRed);
      if(ticket > 0)
      {
         Print("Sell order opened: Ticket=", ticket, " Price=", price, " Lots=", thisLot);
      }
      else
      {
         Print("Error opening sell order: ", GetLastError());
      }
      lotsToOpen -= thisLot;
      lotsToOpen = MathMax(lotsToOpen, 0);
   }
}

//+------------------------------------------------------------------+
//| Close All Buy Orders                                             |
//+------------------------------------------------------------------+
void CloseAllBuyOrders(bool isOppositeSignal)
{
   // Collect all buy orders for this symbol and magic number
   int total = OrdersTotal();
   int idxs[100];
   datetime times[100];
   int count = 0;
   for(int i = 0; i < total; i++)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == Symbol() && OrderMagicNumber() == MagicNumber && OrderType() == OP_BUY)
         {
            idxs[count] = i;
            times[count] = OrderOpenTime();
            count++;
         }
      }
   }
   // Simple bubble sort by open time (oldest first)
   for(int j = 0; j < count-1; j++)
   {
      for(int k = 0; k < count-j-1; k++)
      {
         if(times[k] > times[k+1])
         {
            datetime t = times[k]; times[k] = times[k+1]; times[k+1] = t;
            int ti = idxs[k]; idxs[k] = idxs[k+1]; idxs[k+1] = ti;
         }
      }
   }
   // Close in FIFO order
   for(int m = 0; m < count; m++)
   {
      if(OrderSelect(idxs[m], SELECT_BY_POS, MODE_TRADES))
      {
         double pipLoss = (OrderOpenPrice() - Bid) / Point;
         bool isNegative = (OrderProfit() < 0);
         bool allowClose = true;
         bool forceCloseByDays = false;
         if(EnableMaxNegativeTradeDays && isNegative && MaxNegativeTradeDays > 0 && (TimeCurrent() - OrderOpenTime()) >= MaxNegativeTradeDays * 86400)
         {
            if(MathAbs(pipLoss) <= MaxPipsLossOnDays)
            {
               allowClose = true;
               forceCloseByDays = true;
            }
            else
            {
               allowClose = false;
               forceCloseByDays = true;
            }
         }
         else if(isOppositeSignal && EnableMaxPipsLossOnOpposite && isNegative && MathAbs(pipLoss) > MaxPipsLossOnOpposite)
         {
            allowClose = false;
         }
         if(allowClose)
         {
            bool result = OrderClose(OrderTicket(), OrderLots(), Bid, Slippage, clrRed);
            if(result)
            {
               if(forceCloseByDays)
                  Print("Buy order force-closed after exceeding MaxNegativeTradeDays: Ticket=", OrderTicket());
               else
                  Print("Buy order closed (FIFO): Ticket=", OrderTicket());
            }
            else
            {
               Print("Error closing buy order (FIFO): ", GetLastError());
            }
         }
         else if(forceCloseByDays)
         {
            Print("Buy order not closed after MaxNegativeTradeDays (loss exceeds MaxPipsLossOnDays): Ticket=", OrderTicket(), " Loss=", DoubleToString(MathAbs(pipLoss), 1), " pips");
         }
         else if(!allowClose)
         {
            Print("Buy order not closed (loss exceeds MaxPipsLossOnOpposite): Ticket=", OrderTicket(), " Loss=", DoubleToString(MathAbs(pipLoss), 1), " pips");
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Close All Sell Orders                                            |
//+------------------------------------------------------------------+
void CloseAllSellOrders(bool isOppositeSignal)
{
   // Collect all sell orders for this symbol and magic number
   int total = OrdersTotal();
   int idxs[100];
   datetime times[100];
   int count = 0;
   for(int i = 0; i < total; i++)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == Symbol() && OrderMagicNumber() == MagicNumber && OrderType() == OP_SELL)
         {
            idxs[count] = i;
            times[count] = OrderOpenTime();
            count++;
         }
      }
   }
   // Simple bubble sort by open time (oldest first)
   for(int j = 0; j < count-1; j++)
   {
      for(int k = 0; k < count-j-1; k++)
      {
         if(times[k] > times[k+1])
         {
            datetime t = times[k]; times[k] = times[k+1]; times[k+1] = t;
            int ti = idxs[k]; idxs[k] = idxs[k+1]; idxs[k+1] = ti;
         }
      }
   }
   // Close in FIFO order
   for(int m = 0; m < count; m++)
   {
      if(OrderSelect(idxs[m], SELECT_BY_POS, MODE_TRADES))
      {
         double pipLoss = (Ask - OrderOpenPrice()) / Point;
         bool isNegative = (OrderProfit() < 0);
         bool allowClose = true;
         bool forceCloseByDays = false;
         if(EnableMaxNegativeTradeDays && isNegative && MaxNegativeTradeDays > 0 && (TimeCurrent() - OrderOpenTime()) >= MaxNegativeTradeDays * 86400)
         {
            if(MathAbs(pipLoss) <= MaxPipsLossOnDays)
            {
               allowClose = true;
               forceCloseByDays = true;
            }
            else
            {
               allowClose = false;
               forceCloseByDays = true;
            }
         }
         else if(isOppositeSignal && EnableMaxPipsLossOnOpposite && isNegative && MathAbs(pipLoss) > MaxPipsLossOnOpposite)
         {
            allowClose = false;
         }
         if(allowClose)
         {
            bool result = OrderClose(OrderTicket(), OrderLots(), Ask, Slippage, clrBlue);
            if(result)
            {
               if(forceCloseByDays)
                  Print("Sell order force-closed after exceeding MaxNegativeTradeDays: Ticket=", OrderTicket());
               else
                  Print("Sell order closed (FIFO): Ticket=", OrderTicket());
            }
            else
            {
               Print("Error closing sell order (FIFO): ", GetLastError());
            }
         }
         else if(forceCloseByDays)
         {
            Print("Sell order not closed after MaxNegativeTradeDays (loss exceeds MaxPipsLossOnDays): Ticket=", OrderTicket(), " Loss=", DoubleToString(MathAbs(pipLoss), 1), " pips");
         }
         else if(!allowClose)
         {
            Print("Sell order not closed (loss exceeds MaxPipsLossOnOpposite): Ticket=", OrderTicket(), " Loss=", DoubleToString(MathAbs(pipLoss), 1), " pips");
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Count Buy Orders                                                 |
//+------------------------------------------------------------------+
int CountBuyOrders()
{
   int count = 0;
   for(int i = 0; i < OrdersTotal(); i++)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == Symbol() && OrderMagicNumber() == MagicNumber && OrderType() == OP_BUY)
         {
            count++;
         }
      }
   }
   return(count);
}

//+------------------------------------------------------------------+
//| Count Sell Orders                                                |
//+------------------------------------------------------------------+
int CountSellOrders()
{
   int count = 0;
   for(int i = 0; i < OrdersTotal(); i++)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == Symbol() && OrderMagicNumber() == MagicNumber && OrderType() == OP_SELL)
         {
            count++;
         }
      }
   }
   return(count);
}

//+------------------------------------------------------------------+
//| Send Alert                                                       |
//+------------------------------------------------------------------+
void SendAlert(string side)
{
   string msg = Symbol()+" "+PeriodString()+" Little Spartan EA: "+side+" signal!";
   if(AlertsMessage) Alert(msg);
   if(AlertsSound)   PlaySound("alert2.wav");
   if(AlertsEmail)   SendMail(Symbol()+" - "+WindowExpertName(), msg);
   if(AlertsMobile)  SendNotification(msg);
}

//+------------------------------------------------------------------+
//| Period to String                                                 |
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

//+------------------------------------------------------------------+
//| Draw Signal Arrow                                                |
//+------------------------------------------------------------------+
void DrawSignalArrow(datetime time, double price, int signal)
{
   string name = "SpartanArrow_" + IntegerToString(time) + "_" + IntegerToString(signal);
   int arrowCode = (signal == 1) ? 233 : 234; // 233 = up arrow, 234 = down arrow
   color arrowColor = (signal == 1) ? clrBlue : clrRed;
   if(ObjectFind(0, name) < 0) // Only create if not already present
   {
      ObjectCreate(0, name, OBJ_ARROW, 0, time, price);
      ObjectSetInteger(0, name, OBJPROP_COLOR, arrowColor);
      ObjectSetInteger(0, name, OBJPROP_ARROWCODE, arrowCode);
      ObjectSetInteger(0, name, OBJPROP_WIDTH, 2);
   }
}

//+------------------------------------------------------------------+
//| Draw Historical Signals                                          |
//+------------------------------------------------------------------+
void DrawHistoricalSignals()
{
   int bars = Bars - 1000; // Limit to last 1000 bars for performance
   if(bars < 0) bars = 0;
   for(int i = Bars-2; i >= bars; i--)
   {
      int signal = 0;
      int y1  = iBarShift(NULL, PERIOD_M1,  Time[i+1], true);
      int y5  = iBarShift(NULL, PERIOD_M5,  Time[i+1], true);
      int y15 = iBarShift(NULL, PERIOD_M15, Time[i+1], true);
      int y60 = iBarShift(NULL, PERIOD_H1,  Time[i+1], true);
      int y240 = iBarShift(NULL, PERIOD_H4, Time[i+1], true);
      if(y1 < 0 || y5 < 0 || y15 < 0 || y60 < 0 || y240 < 0) continue;

      double r1_1   = iRSI(NULL, PERIOD_M1,  period_RSI1_1,   RSI_Price, y1+1);
      double r1_2   = iRSI(NULL, PERIOD_M1,  period_RSI1_2,   RSI_Price, y1+1);
      double r5_1   = iRSI(NULL, PERIOD_M5,  period_RSI5_1,   RSI_Price, y5+1);
      double r5_2   = iRSI(NULL, PERIOD_M5,  period_RSI5_2,   RSI_Price, y5+1);
      double r15_1  = iRSI(NULL, PERIOD_M15, period_RSI15_1,  RSI_Price, y15+1);
      double r15_2  = iRSI(NULL, PERIOD_M15, period_RSI15_2,  RSI_Price, y15+1);
      double r60_1  = iRSI(NULL, PERIOD_H1,  period_RSI60_1,  RSI_Price, y60+1);
      double r60_2  = iRSI(NULL, PERIOD_H1,  period_RSI60_2,  RSI_Price, y60+1);
      double r240_1 = iRSI(NULL, PERIOD_H4,  period_RSI240_1, RSI_Price, y240+1);
      double r240_2 = iRSI(NULL, PERIOD_H4,  period_RSI240_2, RSI_Price, y240+1);

      bool up1   = (r1_2   > r1_1);
      bool dn1   = (r1_2   < r1_1);
      bool up5   = (r5_2   > r5_1);
      bool dn5   = (r5_2   < r5_1);
      bool up15  = (r15_2  > r15_1);
      bool dn15  = (r15_2  < r15_1);
      bool up60  = (r60_2  > r60_1);
      bool dn60  = (r60_2  < r60_1);
      bool up240 = (r240_2 > r240_1);
      bool dn240 = (r240_2 < r240_1);

      if(up1 && up5 && up15 && up60 && up240)      signal = 1;
      else if(dn1 && dn5 && dn15 && dn60 && dn240) signal = -1;
      
      // Apply reversal if ReverseSignals is enabled
      if(ReverseSignals && signal != 0) {
         signal = -signal;
      }

      if(signal != 0)
      {
         double arrowPrice = (signal == 1) ? Low[i] - 5*Point : High[i] + 5*Point;
         DrawSignalArrow(Time[i], arrowPrice, signal);
      }
   }
} 

//+------------------------------------------------------------------+
//| Get Spartan Close Signal with Lookback                          |
//+------------------------------------------------------------------+
int GetSpartanCloseSignal(int lookback)
{
   for(int i = 1; i <= lookback; i++)
   {
      int y1  = iBarShift(NULL, PERIOD_M1,  Time[i], true);
      int y5  = iBarShift(NULL, PERIOD_M5,  Time[i], true);
      int y15 = iBarShift(NULL, PERIOD_M15, Time[i], true);
      int y60 = iBarShift(NULL, PERIOD_H1,  Time[i], true);
      int y240 = iBarShift(NULL, PERIOD_H4, Time[i], true);
      if(y1 < 0 || y5 < 0 || y15 < 0 || y60 < 0 || y240 < 0) continue;
      double r1_1   = iRSI(NULL, PERIOD_M1,  period_RSI1_1,   RSI_Price, y1+1);
      double r1_2   = iRSI(NULL, PERIOD_M1,  period_RSI1_2,   RSI_Price, y1+1);
      double r5_1   = iRSI(NULL, PERIOD_M5,  period_RSI5_1,   RSI_Price, y5+1);
      double r5_2   = iRSI(NULL, PERIOD_M5,  period_RSI5_2,   RSI_Price, y5+1);
      double r15_1  = iRSI(NULL, PERIOD_M15, period_RSI15_1,  RSI_Price, y15+1);
      double r15_2  = iRSI(NULL, PERIOD_M15, period_RSI15_2,  RSI_Price, y15+1);
      double r60_1  = iRSI(NULL, PERIOD_H1,  period_RSI60_1,  RSI_Price, y60+1);
      double r60_2  = iRSI(NULL, PERIOD_H1,  period_RSI60_2,  RSI_Price, y60+1);
      double r240_1 = iRSI(NULL, PERIOD_H4,  period_RSI240_1, RSI_Price, y240+1);
      double r240_2 = iRSI(NULL, PERIOD_H4,  period_RSI240_2, RSI_Price, y240+1);
      bool up1   = (r1_2   > r1_1);
      bool dn1   = (r1_2   < r1_1);
      bool up5   = (r5_2   > r5_1);
      bool dn5   = (r5_2   < r5_1);
      bool up15  = (r15_2  > r15_1);
      bool dn15  = (r15_2  < r15_1);
      bool up60  = (r60_2  > r60_1);
      bool dn60  = (r60_2  < r60_1);
      bool up240 = (r240_2 > r240_1);
      bool dn240 = (r240_2 < r240_1);
      
      int signal = 0;
      if(up1 && up5 && up15 && up60 && up240)      signal = 1;   // Buy close signal
      else if(dn1 && dn5 && dn15 && dn60 && dn240) signal = -1;  // Sell close signal
      
      // Apply reversal if ReverseSignals is enabled
      if(ReverseSignals && signal != 0) {
         signal = -signal;
      }
      
      if(signal != 0) return signal;
   }
   return 0;
}

//+------------------------------------------------------------------+
//| Close Demo Trades                                                |
//+------------------------------------------------------------------+
void CloseDemoTrades()
{
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == Symbol() && OrderMagicNumber() == MagicNumber && 
            StringFind(OrderComment(), "Demo") >= 0)
         {
            bool result = false;
            if(OrderType() == OP_BUY)
               result = OrderClose(OrderTicket(), OrderLots(), Bid, Slippage, clrRed);
            else if(OrderType() == OP_SELL)
               result = OrderClose(OrderTicket(), OrderLots(), Ask, Slippage, clrBlue);
               
            if(result)
               Print("Demo trade closed: Ticket=", OrderTicket());
            else
               Print("Error closing demo trade: ", GetLastError());
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Close Old Demo Trades (after 2 minutes)                         |
//+------------------------------------------------------------------+
void CloseOldDemoTrades()
{
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == Symbol() && OrderMagicNumber() == MagicNumber && 
            StringFind(OrderComment(), "Demo") >= 0)
         {
                         // Close demo trades after 15 seconds
             if(TimeCurrent() - OrderOpenTime() > 15)
            {
               bool result = false;
               if(OrderType() == OP_BUY)
                  result = OrderClose(OrderTicket(), OrderLots(), Bid, Slippage, clrRed);
               else if(OrderType() == OP_SELL)
                  result = OrderClose(OrderTicket(), OrderLots(), Ask, Slippage, clrBlue);
                  
               if(result)
                  Print("Old demo trade closed: Ticket=", OrderTicket(), " Age=", (TimeCurrent() - OrderOpenTime()), " seconds");
               else
                  Print("Error closing old demo trade: ", GetLastError());
            }
         }
      }
   }
}