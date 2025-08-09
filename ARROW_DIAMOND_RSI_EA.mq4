#property copyright "Saasa Ivanov"
#property link      "https://saasa.jimdo.com"
#property version   "1.0"
#property strict

//---- input parameters
input double LotSize = 0.1;
input int MagicNumber = 12345;

// Global variables
int barCount = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int init()
{
   Print("EA INITIALIZED");
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
int deinit()
{
   Print("EA DEINITIALIZED");
   return(0);
}

//+------------------------------------------------------------------+
//| Expert start function                                            |
//+------------------------------------------------------------------+
int start()
{
   barCount++;
   Print("BAR #", barCount, " - BID:", Bid, " ASK:", Ask);
   
   // Force a trade every bar
   if(barCount % 2 == 0)
   {
      // Open BUY
      Print("OPENING BUY ORDER");
      int ticket = OrderSend(Symbol(), OP_BUY, LotSize, Ask, 3, 0, 0, "TEST", MagicNumber, 0, Blue);
      if(ticket > 0)
         Print("BUY ORDER SUCCESS - Ticket:", ticket);
      else
         Print("BUY ORDER FAILED - Error:", GetLastError());
   }
   else
   {
      // Open SELL
      Print("OPENING SELL ORDER");
      int ticket = OrderSend(Symbol(), OP_SELL, LotSize, Bid, 3, 0, 0, "TEST", MagicNumber, 0, Red);
      if(ticket > 0)
         Print("SELL ORDER SUCCESS - Ticket:", ticket);
      else
         Print("SELL ORDER FAILED - Error:", GetLastError());
   }
   
   return(0);
} 