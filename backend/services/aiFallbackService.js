exports.fallbackChat = async (message, context) => {
  const lowerMessage = message.toLowerCase();

  try {
    // 1. Inventory Summary & Value
    if (context.inventorySummary && (lowerMessage.includes('value') || lowerMessage.includes('worth') || lowerMessage.includes('summary') || lowerMessage.includes('inventory'))) {
      const s = context.inventorySummary;
      return {
        text: `💰 **Inventory Financial Summary:**\n\n- **Total Products:** ${s.totalProductsCount}\n- **Total Inventory Cost:** ${s.totalInventoryCost}\n- **Projected Retail Value:** ${s.projectedRetailValue}\n- **Potential Gross Profit:** ${s.potentialGrossProfit}`,
        suggestions: ["Show me all products that are currently critically low in stock.", "What are the pending orders?", "Show me the profit margin percentage."]
      };
    }

    // 2. Low Stock / Out of Stock / Restock
    if (context.lowStockAlerts && (lowerMessage.includes('low stock') || lowerMessage.includes('out of stock') || lowerMessage.includes('restock'))) {
      if (context.lowStockAlerts.length === 0) {
        return {
          text: "Great news! You currently have **0 products** running low on stock.",
          suggestions: ["What is my inventory value?", "Show me dead stock.", "What are today's sales?"]
        };
      }
      const list = context.lowStockAlerts.map(p => `- **${p.product}**: ${p.currentStock} remaining (Min: ${p.minimumStock}) [Supplier: ${p.suggestedSupplier}]`).join('\n');
      return { 
        text: `⚠️ **Attention Required:** You have **${context.lowStockAlerts.length} products** critically low or out of stock.\n\n${list}\n\nI recommend generating Purchase Orders for these items immediately.`,
        suggestions: ["Calculate the total financial value of all active inventory.", "What are the pending payments?", "Show me top selling products."]
      };
    }

    // 3. Expiry
    if (context.expiringProducts && lowerMessage.includes('expir')) {
      if (context.expiringProducts.length === 0) return { text: "No products are expiring in the next 30 days.", suggestions: ["Show me low stock items.", "What is our monthly profit?"] };
      const list = context.expiringProducts.map(p => `- **${p.product}**: ${p.stock} units | Date: ${p.date} | Status: **${p.status}**`).join('\n');
      return { text: `📅 **Expiry Alerts:**\n\n${list}`, suggestions: ["Show me dead stock.", "What are today's sales?"] };
    }

    // 4. Dead Stock & Overstock
    if (context.deadStockProducts && (lowerMessage.includes('dead') || lowerMessage.includes('overstock'))) {
      let text = "📦 **Stock Health Alerts:**\n\n";
      if (context.deadStockProducts.length > 0) {
        text += `**Dead Stock (No sales in 30 days):**\n${context.deadStockProducts.slice(0,5).map(p => `- ${p.product}: ${p.stock} units (${p.valueTrapped} trapped)`).join('\n')}\n\n`;
      }
      if (context.overstockProducts && context.overstockProducts.length > 0) {
        text += `**Overstock (Above Maximum):**\n${context.overstockProducts.slice(0,5).map(p => `- ${p.product}: +${p.excess} excess (${p.capitalTiedUp} capital tied)`).join('\n')}`;
      }
      if (context.deadStockProducts.length === 0 && (!context.overstockProducts || context.overstockProducts.length === 0)) {
        text = "Your stock health is excellent! No dead stock or overstock detected.";
      }
      return { text, suggestions: ["What is my inventory value?", "Show me top selling products."] };
    }

    // 5. Sales, Profit & Monthly Sales
    if (context.financials && (lowerMessage.includes('sale') || lowerMessage.includes('profit') || lowerMessage.includes('margin') || lowerMessage.includes('business'))) {
      const f = context.financials;
      return {
        text: `📈 **Financial Performance:**\n\n- **Today's Sales:** ${f.todaysSalesRevenue}\n- **This Month's Revenue:** ${f.thisMonthsRevenue}\n- **This Month's COGS:** ${f.thisMonthsGrossProfit} (Gross Profit)\n- **This Month's Expenses:** ${f.thisMonthsExpenses}\n- **Net Profit (Month):** ${f.thisMonthsNetProfit}`,
        suggestions: ["What are pending payments?", "Show me top selling products.", "Show me low margin products."]
      };
    }

    // 6. Top Selling & Low Margin
    if (context.topSellingProductsLast30Days && (lowerMessage.includes('top') || lowerMessage.includes('margin'))) {
      let text = "🏆 **Product Performance:**\n\n";
      text += `**Top Sellers (30 Days):**\n${context.topSellingProductsLast30Days.map(p => `- ${p.product}: ${p.quantitySold} sold`).join('\n')}\n\n`;
      if (context.lowMarginProducts && context.lowMarginProducts.length > 0) {
        text += `**Low Margin Alert (<10%):**\n${context.lowMarginProducts.map(p => `- ${p.product}: Margin ${p.margin}`).join('\n')}`;
      }
      return { text, suggestions: ["What are today's sales?", "Show me dead stock."] };
    }

    // 7. Pending Payments & Outstanding
    if (context.pendingPayments && (lowerMessage.includes('payment') || lowerMessage.includes('pending') || lowerMessage.includes('owe') || lowerMessage.includes('outstanding'))) {
      const p = context.pendingPayments;
      return {
        text: `💸 **Outstanding Ledger:**\n\n- **Total Accounts Receivable (Customers Owe):** ${p.totalAccountsReceivable}\n- **Total Accounts Payable (We Owe):** ${p.totalAccountsPayable}\n\n**Top Customers:**\n${p.topCustomersOweUs.map(c=>`- ${c}`).join('\n')}\n\n**Top Suppliers:**\n${p.topSuppliersWeOwe.map(s=>`- ${s}`).join('\n')}`,
        suggestions: ["What is our monthly profit?", "Show me top selling products."]
      };
    }

    // 8. Recent Transactions
    if (context.recentInventoryMovements && (lowerMessage.includes('recent') || lowerMessage.includes('transaction'))) {
      return {
        text: `🔄 **Recent Inventory Movements:**\n\n${context.recentInventoryMovements.map(t=>`- ${t}`).join('\n')}`,
        suggestions: ["What is our inventory value?", "Show me low stock items."]
      };
    }

    // Default Smart Response if no specific aggregation hit
    return {
      text: "🧠 **StockFlow AI Local Mode Active**\n\nI am currently operating using the local rule-based intelligence engine. I can provide instant analytics regarding:\n\n- Sales & Profit\n- Dead stock & Overstock\n- Low stock alerts\n- Expiries\n- Pending Payments\n\nTry asking: *'What is our profit this month?'*",
      suggestions: ["What is my inventory value?", "Are there any low stock alerts?", "What are today's sales?"]
    };
  } catch (error) {
    return {
      text: "Error executing AI analytical query. Please check your database connection.",
      suggestions: ["What is my inventory value?", "Are there any low stock alerts?", "What are today's sales?"]
    };
  }
};
