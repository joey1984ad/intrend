#property copyright "Test Trade Script"
#property link      "https://example.com"
#property version   "1.0"
#property script_show_inputs

//---- input parameters
input double LotSize = 0.1;
input int MagicNumber = 88888;

//+------------------------------------------------------------------+
//| Script program start function                                    |
//+------------------------------------------------------------------+
void OnStart()
{
   Print("=== TEST TRADE SCRIPT STARTED ===");
   Print("Symbol: ", Symbol());
   Print("Bid: ", Bid, " Ask: ", Ask);
   Print("Lot Size: ", LotSize);
   Print("Magic Number: ", MagicNumber);
   
   // Check if trading is allowed
   if(!IsTradeAllowed())
   {
      Print("ERROR: Trading is not allowed!");
      return;
   }
   
   // Check if Expert Advisors are allowed
   if(!IsExpertEnabled())
   {
      Print("ERROR: Expert Advisors are not enabled!");
      return;
   }
   
   Print("Trading permissions OK");
   
   // Try to open a BUY order
   Print("=== ATTEMPTING BUY ORDER ===");
   int buyTicket = OrderSend(Symbol(), OP_BUY, LotSize, Ask, 3, 0, 0, "TEST_SCRIPT", MagicNumber, 0, Blue);
   
   if(buyTicket > 0)
   {
      Print("SUCCESS: Buy order opened - Ticket: ", buyTicket);
      Print("Price: ", Ask, " Lot Size: ", LotSize);
      
      // Try to close the order immediately
      Print("=== CLOSING BUY ORDER ===");
      bool closeResult = OrderClose(buyTicket, LotSize, Bid, 3, Red);
      if(closeResult)
      {
         Print("SUCCESS: Buy order closed");
      }
      else
      {
         int error = GetLastError();
         Print("ERROR closing buy order: ", error);
      }
   }
   else
   {
      int error = GetLastError();
      Print("ERROR opening buy order: ", error);
      Print("Error description: ", ErrorDescription(error));
   }
   
   // Try to open a SELL order
   Print("=== ATTEMPTING SELL ORDER ===");
   int sellTicket = OrderSend(Symbol(), OP_SELL, LotSize, Bid, 3, 0, 0, "TEST_SCRIPT", MagicNumber, 0, Red);
   
   if(sellTicket > 0)
   {
      Print("SUCCESS: Sell order opened - Ticket: ", sellTicket);
      Print("Price: ", Bid, " Lot Size: ", LotSize);
      
      // Try to close the order immediately
      Print("=== CLOSING SELL ORDER ===");
      bool closeResult = OrderClose(sellTicket, LotSize, Ask, 3, Blue);
      if(closeResult)
      {
         Print("SUCCESS: Sell order closed");
      }
      else
      {
         int error = GetLastError();
         Print("ERROR closing sell order: ", error);
      }
   }
   else
   {
      int error = GetLastError();
      Print("ERROR opening sell order: ", error);
      Print("Error description: ", ErrorDescription(error));
   }
   
   Print("=== TEST TRADE SCRIPT COMPLETED ===");
} 