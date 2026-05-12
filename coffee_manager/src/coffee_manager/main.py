from fastapi import FastAPI

from coffee_manager.routers import (
    api_keys,
    auth,
    buildings,
    distributors,
    inventory,
    optimization,
    orders,
)

app = FastAPI(title="Coffee Supply Management API", version="1.0.0")

app.include_router(auth.router)
app.include_router(distributors.router)
app.include_router(api_keys.router)
app.include_router(buildings.router)
app.include_router(inventory.router)
app.include_router(orders.router)
app.include_router(optimization.router)


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "coffee-supply-api", "version": "1.0.0"}
