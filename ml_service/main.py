from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta

app = FastAPI(title="StockFlow ML Intelligence Service")

# Pydantic Models for requests
class ProductData(BaseModel):
    id: str
    productName: str
    currentStock: int
    minimumStock: int
    purchasePrice: float
    sellingPrice: float
    category: Optional[str] = None
    salesHistory: List[int] = [] # Monthly or weekly sales data

class InventoryRequest(BaseModel):
    products: List[ProductData]

# Dummy model training for demonstration purposes
# In a real app, you'd load a pre-trained model (e.g., joblib.load('model.pkl'))
dummy_model = RandomForestRegressor(n_estimators=10, random_state=42)
X_dummy = np.random.rand(100, 3) # Features: avg_sales, price, stock
y_dummy = np.random.rand(100) * 100 # Target: predicted next month demand
dummy_model.fit(X_dummy, y_dummy)
scaler = StandardScaler()
scaler.fit(X_dummy)

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "StockFlow ML"}

@app.post("/api/ml/analyze")
def analyze_inventory(req: InventoryRequest):
    try:
        results = []
        
        for p in req.products:
            # 1. Health Score Calculation (0-100)
            health_score = 100
            
            # Penalize for low stock or out of stock
            if p.currentStock <= 0:
                health_score -= 50
                stock_status = "Out of Stock"
            elif p.currentStock <= p.minimumStock:
                health_score -= 30
                stock_status = "Low Stock"
            else:
                stock_status = "Healthy"
                
            # Penalize for overstock (arbitrary rule: if stock > 3 * min stock)
            if p.currentStock > (p.minimumStock * 3) and p.minimumStock > 0:
                health_score -= 20
                stock_status = "Overstocked"

            # 2. Movement Classification (Fast/Slow/Dead)
            avg_sales = np.mean(p.salesHistory) if p.salesHistory else 0
            if avg_sales > 50:
                movement = "Fast-Moving"
            elif avg_sales > 5:
                movement = "Slow-Moving"
            elif len(p.salesHistory) > 3 and sum(p.salesHistory[-3:]) == 0:
                movement = "Dead Stock"
            else:
                movement = "Unclassified"

            # 3. Demand Prediction (using Dummy Model)
            # Feature vector: [avg_sales, sellingPrice, currentStock]
            features = np.array([[avg_sales, p.sellingPrice, p.currentStock]])
            scaled_features = scaler.transform(features)
            predicted_demand = max(0, int(dummy_model.predict(scaled_features)[0]))

            # 4. Restock Recommendation
            restock_needed = False
            recommended_quantity = 0
            if p.currentStock < predicted_demand or p.currentStock <= p.minimumStock:
                restock_needed = True
                recommended_quantity = max(p.minimumStock * 2, predicted_demand * 2) - p.currentStock

            results.append({
                "productId": p.id,
                "productName": p.productName,
                "healthScore": max(0, health_score),
                "stockStatus": stock_status,
                "movementClassification": movement,
                "predictedDemand": predicted_demand,
                "restockNeeded": restock_needed,
                "recommendedRestockQuantity": recommended_quantity if restock_needed else 0
            })
            
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
