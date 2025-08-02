//+------------------------------------------------------------------+
//| Spartan Arrow EA (Fixed Version)                                 |
//| Uses Spartan No bad history V1 - Copy.mq4                        |
//+------------------------------------------------------------------+
#property copyright "Spartan EA"
#property link      ""
#property version   "1.0"
#property strict

//--- input parameters
input double Lots = 0.1;
input int Slippage = 3;
input string IndicatorName = "Spartan No bad history V1 - Copy";
input int MagicNumber = 12345;
input bool UseStopLoss = false;
input double StopLoss = 50.0;
input bool UseTakeProfit = false;
input double TakeProfit = 100.0;

//--- global variables
int lastBuyBar = -1;
int lastSellBar = -1;
datetime lastBuyTime = 0;
datetime lastSellTime = 0;
bool isNewBar = false;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("Spartan Arrow EA initialized");
   Print("Indicator name: ", IndicatorName);
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("Spartan Arrow EA deinitialized");
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Check for new bar
   static datetime lastBarTime = 0;
   if(Time[0] != lastBarTime)
   {
      lastBarTime = Time[0];
      isNewBar = true;
   }
   else
   {
      isNewBar = false;
   }

   // Get current bar index
   int currentBar = iBars(NULL, 0) - 1;
   
   // Read indicator values
   double upArrow = iCustom(NULL, 0, IndicatorName, 0, 0); // Buffer 0, current bar
   double dnArrow = iCustom(NULL, 0, IndicatorName, 1, 0); // Buffer 1, current bar
   
   // Debug info (comment out in production)
   if(isNewBar)
   {
      Print("Bar: ", currentBar, " Up: ", upArrow, " Down: ", dnArrow);
   }

   // Check for new BUY signal
   if(upArrow != EMPTY_VALUE && upArrow != 0.0)
   {
      // Check if this is a new signal (not the same bar as last buy)
      if(lastBuyBar != currentBar)
      {
         Print("NEW BUY SIGNAL detected on bar: ", currentBar);
         lastBuyBar = currentBar;
         lastBuyTime = Time[0];
         
         // Close any existing SELL trades
         CloseAllTrades(OP_SELL);
         
         // Open new BUY trade if no BUY trade exists
         if(!HasOpenTrade(OP_BUY))
         {
            OpenTrade(OP_BUY);
         }
      }
   }
   
   // Check for new SELL signal
   if(dnArrow != EMPTY_VALUE && dnArrow != 0.0)
   {
      // Check if this is a new signal (not the same bar as last sell)
      if(lastSellBar != currentBar)
      {
         Print("NEW SELL SIGNAL detected on bar: ", currentBar);
         lastSellBar = currentBar;
         lastSellTime = Time[0];
         
         // Close any existing BUY trades
         CloseAllTrades(OP_BUY);
         
         // Open new SELL trade if no SELL trade exists
         if(!HasOpenTrade(OP_SELL))
         {
            OpenTrade(OP_SELL);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Open trade function                                              |
//+------------------------------------------------------------------+
void OpenTrade(int type)
{
   double price = (type == OP_BUY) ? Ask : Bid;
   double sl = 0.0, tp = 0.0;
   
   // Calculate stop loss and take profit
   if(UseStopLoss)
   {
      if(type == OP_BUY)
         sl = price - StopLoss * Point;
      else
         sl = price + StopLoss * Point;
   }
   
   if(UseTakeProfit)
   {
      if(type == OP_BUY)
         tp = price + TakeProfit * Point;
      else
         tp = price - TakeProfit * Point;
   }
   
   int ticket = OrderSend(Symbol(), type, Lots, price, Slippage, sl, tp, 
                         "SpartanEA", MagicNumber, 0, 
                         (type == OP_BUY) ? clrBlue : clrRed);
   
   if(ticket > 0)
   {
      Print("Opened ", (type == OP_BUY) ? "BUY" : "SELL", " trade, ticket: ", ticket, 
            " Price: ", price, " SL: ", sl, " TP: ", tp);
   }
   else
   {
      Print("OrderSend failed: ", GetLastError(), " for ", 
            (type == OP_BUY) ? "BUY" : "SELL", " trade");
   }
}

//+------------------------------------------------------------------+
//| Close all trades of given type                                   |
//+------------------------------------------------------------------+
void CloseAllTrades(int type)
{
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == Symbol() && OrderType() == type && OrderMagicNumber() == MagicNumber)
         {
            double price = (type == OP_BUY) ? Bid : Ask;
            bool closed = OrderClose(OrderTicket(), OrderLots(), price, Slippage, clrNONE);
            
            if(closed)
            {
               Print("Closed ", (type == OP_BUY) ? "BUY" : "SELL", " trade, ticket: ", OrderTicket());
            }
            else
            {
               Print("OrderClose failed: ", GetLastError(), " for ticket: ", OrderTicket());
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Check if there is an open trade of given type                    |
//+------------------------------------------------------------------+
bool HasOpenTrade(int type)
{
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == Symbol() && OrderType() == type && OrderMagicNumber() == MagicNumber)
         {
            return true;
         }
      }
   }
   return false;
}

//+------------------------------------------------------------------+
//| Get total open trades count                                       |
//+------------------------------------------------------------------+
int GetOpenTradesCount()
{
   int count = 0;
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == Symbol() && OrderMagicNumber() == MagicNumber)
         {
            count++;
         }
      }
   }
   return count;
} 