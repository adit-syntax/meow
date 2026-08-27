"""
machine_learning/__init__.py
SkyGuard AI — 5-Tier Machine Learning & Physics-Guided QC Pipeline Module.
"""

from machine_learning.pipeline.pipeline import SkyGuardPipeline, InferenceResult, TierScores
from machine_learning.pipeline.preprocessor import DataPreprocessor, PreprocessorResult
from machine_learning.pipeline.tier1_qc import Tier1QC, Tier1QCResult
from machine_learning.pipeline.tier2_point_ml import IsolationForestPointDetector
from machine_learning.pipeline.tier2_temporal_ml import TemporalAutoencoderDetector
from machine_learning.pipeline.tier3_multivariate import Tier3MultivariateDetector, Tier3Result
from machine_learning.pipeline.tier4_classifier import FaultClassifier, ClassificationResult
from machine_learning.pipeline.tier5_explain import ExplainabilityEngine, ExplanationResult
from machine_learning.pipeline.tier5_health import SensorHealthEngine, HealthStatus, DegradationRisk
from machine_learning.pipeline.fusion import AnomalyFusionEngine, FusionResult

__all__ = [
    "SkyGuardPipeline",
    "InferenceResult",
    "TierScores",
    "DataPreprocessor",
    "PreprocessorResult",
    "Tier1QC",
    "Tier1QCResult",
    "IsolationForestPointDetector",
    "TemporalAutoencoderDetector",
    "Tier3MultivariateDetector",
    "Tier3Result",
    "FaultClassifier",
    "ClassificationResult",
    "ExplainabilityEngine",
    "ExplanationResult",
    "SensorHealthEngine",
    "HealthStatus",
    "DegradationRisk",
    "AnomalyFusionEngine",
    "FusionResult",
]
