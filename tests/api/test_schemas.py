"""
Schema validation tests — verify Pydantic contracts are correct.
"""
import pytest


def test_upload_response_schema():
    """Verify UploadResponse can be instantiated."""
    from api.schemas.data import UploadResponse

    resp = UploadResponse(
        filename="test.csv",
        rows=100,
        columns=["Date", "ED"],
        preview=[{"Date": "2024-01-01", "ED": 150}],
        dataset_id="abc-123",
    )
    assert resp.rows == 100
    assert resp.dataset_id == "abc-123"


def test_eda_response_schema():
    """Verify EDAResponse can be instantiated."""
    from api.schemas.data import EDAResponse, ColumnSummary

    resp = EDAResponse(
        dataset_id="test-id",
        rows=365,
        columns=10,
        column_summaries=[
            ColumnSummary(name="ED", dtype="int64", non_null=365, null_count=0, null_pct=0.0, unique=80)
        ],
        correlations={"Temp": 0.35},
        missing_by_column={},
        target_stats={"mean": 150.0, "std": 20.0},
        dow_averages={"Monday": 160.0},
        monthly_averages={"January": 165.0},
        numeric_columns=["ED", "Temp"],
        date_column="Date",
    )
    assert resp.rows == 365
    assert resp.correlations["Temp"] == 0.35


def test_train_request_schema():
    """Verify TrainRequest can be instantiated with defaults."""
    from api.schemas.ml import TrainRequest

    req = TrainRequest(dataset_id="test-id", model_type="xgboost")
    assert req.horizons == [1, 2, 3, 4, 5, 6, 7]
    assert req.auto_tune is False
    assert req.n_trials == 50


def test_staff_optimize_request_schema():
    """Verify StaffOptimizeRequest defaults."""
    from api.schemas.optimization import StaffOptimizeRequest

    req = StaffOptimizeRequest(dataset_id="test-id")
    assert req.planning_horizon == 10
    assert req.overtime_multiplier == 1.5
    assert req.min_staff_per_shift == 2


def test_inventory_item_schema():
    """Verify InventoryItem defaults."""
    from api.schemas.optimization import InventoryItem

    item = InventoryItem(item_id="PPE-001", name="Masks", category="PPE", unit_cost=2.5)
    assert item.criticality == "MEDIUM"
    assert item.holding_cost_rate == 0.20
    assert item.lead_time == 3


def test_fuse_request_optional_fields():
    """Verify FuseRequest allows optional fields."""
    from api.schemas.data import FuseRequest

    req = FuseRequest(patient_dataset_id="p-123")
    assert req.weather_dataset_id is None
    assert req.calendar_dataset_id is None
    assert req.reason_dataset_id is None
