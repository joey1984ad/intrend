#property copyright "Simple Trade EA"
#property link      "https://example.com"
#property version   "1.0"
#property strict

//---- input parameters
input double LotSize = 0.1;
input int MagicNumber = 99999;

// Global variables
int barCount = 0;
bool eaRunning = false;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int init()
{
   Print("=== SIMPLE TRADE EA INITIALIZED ===");
   Print("Lot Size: ", LotSize);
   Print("Magic Number: ", MagicNumber);
   
   // Check if trading is allowed
   if(!IsTradeAllowed())
   {
      Print("ERROR: Trading is not allowed!");
      return(INIT_FAILED);
   }
   
   // Check if Expert Advisors are allowed
   if(!IsExpertEnabled())
   {
      Print("ERROR: Expert Advisors are not enabled!");
      return(INIT_FAILED);
   }
   
   eaRunning = true;
   Print("EA is ready to trade!");
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
int deinit()
{
   Print("=== SIMPLE TRADE EA DEINITIALIZED ===");
   eaRunning = false;
   return(0);
}

//+------------------------------------------------------------------+
//| Expert start function                                            |
//+------------------------------------------------------------------+
int start()
{
   if(!eaRunning)
   {
      Print("ERROR: EA not properly initialized!");
      return(0);
   }
   
   barCount++;
   Print("=== BAR #", barCount, " ===");
   Print("BID: ", Bid, " ASK: ", Ask);
   Print("Trading allowed: ", IsTradeAllowed());
   Print("Expert enabled: ", IsExpertEnabled());
   
   // Force a trade every bar
   if(barCount % 2 == 0)
   {
      // Open BUY
      Print("=== OPENING BUY ORDER ===");
      Print("Attempting to buy ", LotSize, " lots at ", Ask);
      
      int ticket = OrderSend(Symbol(), OP_BUY, LotSize, Ask, 3, 0, 0, "SIMPLE_TRADE", MagicNumber, 0, Blue);
      if(ticket > 0)
      {
         Print("=== BUY ORDER SUCCESS ===");
         Print("Ticket: ", ticket);
         Print("Price: ", Ask);
         Print("Lot Size: ", LotSize);
      }
      else
      {
         int error = GetLastError();
         Print("=== BUY ORDER FAILED ===");
         Print("Error Code: ", error);
         Print("Error Description: ", ErrorDescription(error));
         
         // Try to get more info about the error
         switch(error)
         {
            case 130: Print("Invalid stops - try different parameters"); break;
            case 131: Print("Invalid trade volume - check lot size"); break;
            case 138: Print("Market closed - check trading hours"); break;
            case 139: Print("Order locked - another order pending"); break;
            case 146: Print("Trading subsystem busy - try again"); break;
            case 147: Print("Trading time expired - market closed"); break;
            default: Print("Unknown error - check broker settings"); break;
         }
      }
   }
   else
   {
      // Open SELL
      Print("=== OPENING SELL ORDER ===");
      Print("Attempting to sell ", LotSize, " lots at ", Bid);
      
      int ticket = OrderSend(Symbol(), OP_SELL, LotSize, Bid, 3, 0, 0, "SIMPLE_TRADE", MagicNumber, 0, Red);
      if(ticket > 0)
      {
         Print("=== SELL ORDER SUCCESS ===");
         Print("Ticket: ", ticket);
         Print("Price: ", Bid);
         Print("Lot Size: ", LotSize);
      }
      else
      {
         int error = GetLastError();
         Print("=== SELL ORDER FAILED ===");
         Print("Error Code: ", error);
         Print("Error Description: ", ErrorDescription(error));
         
         // Try to get more info about the error
         switch(error)
         {
            case 130: Print("Invalid stops - try different parameters"); break;
            case 131: Print("Invalid trade volume - check lot size"); break;
            case 138: Print("Market closed - check trading hours"); break;
            case 139: Print("Order locked - another order pending"); break;
            case 146: Print("Trading subsystem busy - try again"); break;
            case 147: Print("Trading time expired - market closed"); break;
            default: Print("Unknown error - check broker settings"); break;
         }
      }
   }
   
   return(0);
} 