from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

app = FastAPI(title="StockFlow ML Intelligence Service")

class ProductData(BaseModel):
    id: str
    productName: str
    currentStock: int
    minimumStock: int
    purchasePrice: float
    sellingPrice: float
    category: Optional[str] = None
    salesHistory: List[int] = []

class InventoryRequest(BaseModel):
    products: List[ProductData]

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "StockFlow ML"}

@app.post("/api/ml/analyze")
def analyze_inventory(req: InventoryRequest):
    try:
        # Check for insufficient data
        total_sales_ever = sum([sum(p.salesHistory) for p in req.products])
        insufficient_data = total_sales_ever == 0

        # Build dynamic dataset if sufficient data exists
        X_train = []
        y_train = []
        
        if not insufficient_data:
            for p in req.products:
                h = p.salesHistory
                # We need at least 4 months of data to train (e.g. 3 months features -> 4th month target)
                if len(h) >= 4:
                    # Rolling window of size 3
                    for i in range(len(h) - 3):
                        features = [h[i], h[i+1], h[i+2], p.sellingPrice, p.currentStock]
                        target = h[i+3]
                        X_train.append(features)
                        y_train.append(target)

        # Train model if we built a dataset
        model_ready = False
        scaler = StandardScaler()
        rf_model = RandomForestRegressor(n_estimators=20, random_state=42)

        if len(X_train) > 0:
            X_scaled = scaler.fit_transform(X_train)
            rf_model.fit(X_scaled, y_train)
            model_ready = True
        else:
            # Even if total sales > 0, we might not have enough sequential windows
            insufficient_data = True

        results = []
        
        for p in req.products:
            # 1. Health Score Calculation (0-100)
            health_score = 100
            
            if p.currentStock <= 0:
                health_score -= 50
                stock_status = "Out of Stock"
            elif p.currentStock <= p.minimumStock:
                health_score -= 30
                stock_status = "Low Stock"
            else:
                stock_status = "Healthy"
                
            if p.currentStock > (p.minimumStock * 3) and p.minimumStock > 0:
                health_score -= 20
                stock_status = "Overstocked"

            # 2. Movement Classification
            h = p.salesHistory
            avg_sales = np.mean(h) if h else 0
            
            if avg_sales > 20:
                movement = "Fast-Moving"
            elif avg_sales > 5:
                movement = "Slow-Moving"
            elif sum(h[-3:]) == 0 and sum(h) > 0:
                movement = "Dead Stock"
            else:
                movement = "Unclassified"

            # 3. Demand Prediction
            predicted_demand = 0
            if model_ready and len(h) >= 3:
                # Predict next month based on last 3 months
                features = np.array([[h[-3], h[-2], h[-1], p.sellingPrice, p.currentStock]])
                scaled_features = scaler.transform(features)
                predicted_demand = max(0, int(rf_model.predict(scaled_features)[0]))
            
            # If insufficient data, we just return 0 for prediction
            if insufficient_data:
                predicted_demand = 0

            # 4. Restock Recommendation
            restock_needed = False
            recommended_quantity = 0
            
            if p.currentStock <= p.minimumStock or (model_ready and p.currentStock < predicted_demand):
                restock_needed = True
                # Order enough to cover predicted demand + minimum buffer
                target_stock = max(p.minimumStock * 2, predicted_demand + p.minimumStock)
                recommended_quantity = target_stock - p.currentStock

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
            
        return {"success": True, "data": results, "insufficientData": insufficient_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
