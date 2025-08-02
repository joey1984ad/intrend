#property copyright "Force Trade EA"
#property link      "https://example.com"
#property version   "1.0"
#property strict

//---- input parameters
input double LotSize = 0.01;  // Very small lot size
input int MagicNumber = 77777;

// Global variables
int barCount = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int init()
{
   Print("=== FORCE TRADE EA INITIALIZED ===");
   Print("Lot Size: ", LotSize);
   Print("Magic Number: ", MagicNumber);
   Print("Symbol: ", Symbol());
   Print("Period: ", Period());
   Print("Point: ", Point);
   Print("Digits: ", Digits);
   Print("Spread: ", MarketInfo(Symbol(), MODE_SPREAD));
   Print("Min Lot: ", MarketInfo(Symbol(), MODE_MINLOT));
   Print("Max Lot: ", MarketInfo(Symbol(), MODE_MAXLOT));
   Print("Lot Step: ", MarketInfo(Symbol(), MODE_LOTSTEP));
   
   // Check permissions
   Print("IsTradeAllowed: ", IsTradeAllowed());
   Print("IsExpertEnabled: ", IsExpertEnabled());
   Print("IsConnected: ", IsConnected());
   Print("IsDemo: ", IsDemo());
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
int deinit()
{
   Print("=== FORCE TRADE EA DEINITIALIZED ===");
   return(0);
}

//+------------------------------------------------------------------+
//| Expert start function                                            |
//+------------------------------------------------------------------+
int start()
{
   barCount++;
   Print("=== BAR #", barCount, " ===");
   Print("Time: ", TimeToString(Time[0]));
   Print("BID: ", Bid, " ASK: ", Ask);
   Print("Spread: ", Ask - Bid);
   
   // Force a trade every bar
   if(barCount % 2 == 0)
   {
      // Open BUY
      Print("=== ATTEMPTING BUY ORDER ===");
      Print("Lot Size: ", LotSize);
      Print("Ask Price: ", Ask);
      Print("Slippage: 3");
      
      int ticket = OrderSend(Symbol(), OP_BUY, LotSize, Ask, 3, 0, 0, "FORCE_TRADE", MagicNumber, 0, Blue);
      
      if(ticket > 0)
      {
         Print("=== BUY ORDER SUCCESS ===");
         Print("Ticket: ", ticket);
         Print("Price: ", Ask);
         Print("Lot Size: ", LotSize);
         
         // Try to close immediately
         Print("=== CLOSING BUY ORDER ===");
         bool closeResult = OrderClose(ticket, LotSize, Bid, 3, Red);
         if(closeResult)
         {
            Print("SUCCESS: Buy order closed immediately");
         }
         else
         {
            int closeError = GetLastError();
            Print("ERROR closing buy order: ", closeError);
         }
      }
      else
      {
         int error = GetLastError();
         Print("=== BUY ORDER FAILED ===");
         Print("Error Code: ", error);
         Print("Error Description: ", ErrorDescription(error));
         
         // Detailed error analysis
         switch(error)
         {
            case 0: Print("No error"); break;
            case 1: Print("No error, trade conditions not changed"); break;
            case 2: Print("Common error"); break;
            case 3: Print("Invalid trade parameters"); break;
            case 4: Print("Trade server is busy"); break;
            case 5: Print("Old version of the client terminal"); break;
            case 6: Print("No connection with trade server"); break;
            case 7: Print("Not enough rights"); break;
            case 8: Print("Too frequent requests"); break;
            case 9: Print("Malfunctional trade operation"); break;
            case 64: Print("Account disabled"); break;
            case 65: Print("Invalid account"); break;
            case 128: Print("Trade timeout"); break;
            case 129: Print("Invalid price"); break;
            case 130: Print("Invalid stops"); break;
            case 131: Print("Invalid trade volume"); break;
            case 132: Print("Market is closed"); break;
            case 133: Print("Trade is disabled"); break;
            case 134: Print("Not enough money"); break;
            case 135: Print("Price changed"); break;
            case 136: Print("Off quotes"); break;
            case 137: Print("Broker is busy"); break;
            case 138: Print("Requote"); break;
            case 139: Print("Order is locked"); break;
            case 140: Print("Long positions only allowed"); break;
            case 141: Print("Too many requests"); break;
            case 145: Print("Modification denied because order too close to market"); break;
            case 146: Print("Trade context is busy"); break;
            case 147: Print("Expirations are denied by broker"); break;
            case 148: Print("Amount of open and pending orders has reached the limit set by broker"); break;
            default: Print("Unknown error"); break;
         }
      }
   }
   else
   {
      // Open SELL
      Print("=== ATTEMPTING SELL ORDER ===");
      Print("Lot Size: ", LotSize);
      Print("Bid Price: ", Bid);
      Print("Slippage: 3");
      
      int ticket = OrderSend(Symbol(), OP_SELL, LotSize, Bid, 3, 0, 0, "FORCE_TRADE", MagicNumber, 0, Red);
      
      if(ticket > 0)
      {
         Print("=== SELL ORDER SUCCESS ===");
         Print("Ticket: ", ticket);
         Print("Price: ", Bid);
         Print("Lot Size: ", LotSize);
         
         // Try to close immediately
         Print("=== CLOSING SELL ORDER ===");
         bool closeResult = OrderClose(ticket, LotSize, Ask, 3, Blue);
         if(closeResult)
         {
            Print("SUCCESS: Sell order closed immediately");
         }
         else
         {
            int closeError = GetLastError();
            Print("ERROR closing sell order: ", closeError);
         }
      }
      else
      {
         int error = GetLastError();
         Print("=== SELL ORDER FAILED ===");
         Print("Error Code: ", error);
         Print("Error Description: ", ErrorDescription(error));
         
         // Same detailed error analysis as above
         switch(error)
         {
            case 0: Print("No error"); break;
            case 1: Print("No error, trade conditions not changed"); break;
            case 2: Print("Common error"); break;
            case 3: Print("Invalid trade parameters"); break;
            case 4: Print("Trade server is busy"); break;
            case 5: Print("Old version of the client terminal"); break;
            case 6: Print("No connection with trade server"); break;
            case 7: Print("Not enough rights"); break;
            case 8: Print("Too frequent requests"); break;
            case 9: Print("Malfunctional trade operation"); break;
            case 64: Print("Account disabled"); break;
            case 65: Print("Invalid account"); break;
            case 128: Print("Trade timeout"); break;
            case 129: Print("Invalid price"); break;
            case 130: Print("Invalid stops"); break;
            case 131: Print("Invalid trade volume"); break;
            case 132: Print("Market is closed"); break;
            case 133: Print("Trade is disabled"); break;
            case 134: Print("Not enough money"); break;
            case 135: Print("Price changed"); break;
            case 136: Print("Off quotes"); break;
            case 137: Print("Broker is busy"); break;
            case 138: Print("Requote"); break;
            case 139: Print("Order is locked"); break;
            case 140: Print("Long positions only allowed"); break;
            case 141: Print("Too many requests"); break;
            case 145: Print("Modification denied because order too close to market"); break;
            case 146: Print("Trade context is busy"); break;
            case 147: Print("Expirations are denied by broker"); break;
            case 148: Print("Amount of open and pending orders has reached the limit set by broker"); break;
            default: Print("Unknown error"); break;
         }
      }
   }
   
   return(0);
} 