from fastapi import FastAPI

from coffee_optimizer.models import OptimizationRequest, OptimizationResult
from coffee_optimizer.optimizer import run_optimization

app = FastAPI(title="Coffee Optimizer API", version="1.0.0")


@app.post("/optimize", response_model=OptimizationResult)
def optimize(request: OptimizationRequest) -> OptimizationResult:
    return run_optimization(request)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "coffee-optimizer"}
