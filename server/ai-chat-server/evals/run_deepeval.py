# from __future__ import annotations
import argparse
import importlib
import json
import statistics
import sys
import time
import asyncio
import importlib
from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

project_root = Path(__file__).resolve().parent.parent

load_dotenv(project_root / "app" / ".env")

if not os.getenv("OPENAI_API_KEY"):
    raise RuntimeError(
        "OPENAI_API_KEY was not found. "
        "Check the .env file in the project root."
    )

def load_adapter():
    try:
        module = importlib.import_module("evals.run_adapter")
        return module.run_question_async
    except (ImportError, AttributeError) as exc:
        raise RuntimeError(
            "Expected evals/run_adapter.py to expose "
            "async def run_question_async(question)."
        ) from exc


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="evals/golden_dataset.json")
    parser.add_argument("--output", default="evals/results.json")
    parser.add_argument("--limit", type=int, default=0, help="0 means all cases")
    parser.add_argument(
        "--case-id",
        type=str,
        default=None,
        help="Run a specific case, e.g. GS-015",
    )
    # Add this argument
    parser.add_argument(
        "--version",
        type=str,
        default=None,
        help="Optional evaluation version label, e.g. baseline or hybrid-v2",
    )
    args = parser.parse_args()

    try:
        from deepeval.metrics.answer_relevancy.answer_relevancy import AnswerRelevancyMetric
        from deepeval.metrics.contextual_precision.contextual_precision import ContextualPrecisionMetric
        from deepeval.metrics.contextual_recall.contextual_recall import ContextualRecallMetric
        from deepeval.metrics.faithfulness.faithfulness import FaithfulnessMetric
        from deepeval.test_case.llm_test_case import LLMTestCase
    except ImportError as exc:
        python = sys.executable
        raise SystemExit(
            "DeepEval is not available to this Python interpreter:\n"
            f"  {python}\n"
            "Install it into the active environment with:\n"
            f'  "{python}" -m pip install "deepeval>=2.0,<3.0"\n'
            "In VS Code, select the project interpreter at "
            "server/ai-chat-server/.venv/Scripts/python.exe, then run the command again."
        ) from exc


    dataset = json.loads(Path(args.input).read_text(encoding="utf-8"))

    # Filter by case ID first, if specified.
    if args.case_id:
        dataset = [
            item for item in dataset
            if item.get("id") == args.case_id
        ]

        if not dataset:
            raise SystemExit(
                f"No test case found with id: {args.case_id} "
                f"in {args.input}"
            )

    # Apply limit after filtering.
    if args.limit > 0:
        dataset = dataset[:args.limit]

    print(f"Running {len(dataset)} evaluation case(s)")

    run_question = load_adapter()

    async def run_all_questions(dataset, run_question):
        results = []

        for item in dataset:
            result = await run_question(item["question"])
            results.append(result)

        return results

    results = asyncio.run(
        run_all_questions(dataset, run_question)
    )

    cases = []
    raw = []
    latencies = []

    for item, result in zip(dataset, results):
        elapsed_ms = float(result.get("latency_ms", 0))
        latencies.append(elapsed_ms)

        contexts = result.get("retrieved_contexts") or []
        answer = result.get("answer", "")

        case = LLMTestCase(
            input=item["question"],
            actual_output=answer,
            expected_output=item["reference_answer"],
            retrieval_context=contexts,
        )
        cases.append(case)

        raw.append({
            "id": item["id"],
            "question": item["question"],
            "reference_answer": item["reference_answer"],
            "actual_answer": answer,
            "retrieved_contexts": contexts,
            "retrieved_sources": result.get("retrieved_sources", []),
            "latency_ms": elapsed_ms,
            "answerable": item["answerable"],
            "source_files": item.get("source_files", []),
            "expected_evidence": item.get("expected_evidence"),
            "tags": item.get("tags", []),
            "review_status": item.get("review_status"),
        })

    metrics = [
        FaithfulnessMetric(threshold=0.7, include_reason=True),
        AnswerRelevancyMetric(threshold=0.7, include_reason=True),
        ContextualPrecisionMetric(threshold=0.7, include_reason=True),
        ContextualRecallMetric(threshold=0.7, include_reason=True),
    ]
    
    # DeepEval metric API runs each metric on each test case.
    per_case = []

    for item, case in zip(raw, cases):
        row = {
            "id": item["id"],
            "question": item["question"],
            "metrics": {},
        }

        if item["answerable"]:
            selected_metric_classes = [
                FaithfulnessMetric,
                AnswerRelevancyMetric,
                ContextualPrecisionMetric,
                ContextualRecallMetric,
            ]
        else:
            selected_metric_classes = [
                FaithfulnessMetric,
                AnswerRelevancyMetric,
            ]

        for metric_class in selected_metric_classes:
            metric = metric_class(
                threshold=0.7,
                include_reason=True,
            )

            metric_name = metric_class.__name__

            try:
                metric.measure(case)

                row["metrics"][metric_name] = {
                    "score": metric.score,
                    "success": metric.is_successful(),
                    "reason": getattr(metric, "reason", None),
                }

            except Exception as exc:
                row["metrics"][metric_name] = {
                    "error": str(exc),
                }

        per_case.append(row)

    names = [m.__class__.__name__ for m in metrics]
    summary = {}
    
    for name in names:
        scores = [
            row["metrics"][name]["score"]
            for row in per_case
            if name in row["metrics"] and isinstance(row["metrics"][name].get("score"), (int, float))
        ]
        summary[name] = {"mean_score": statistics.mean(scores) if scores else None, "n_scored": len(scores)}
    sorted_latencies = sorted(latencies)

    def percentile(p):
        if not sorted_latencies:
            return None
        idx = min(len(sorted_latencies) - 1, max(0, round((p / 100) * (len(sorted_latencies) - 1))))
        return round(sorted_latencies[idx], 2)

    output = {
        "run_timestamp_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "dataset_path": args.input,
        "case_count": len(raw),
        "latency_ms": {"p50": percentile(50), "p95": percentile(95)},
        "summary": summary,
        "cases": raw,
        "metric_details": per_case,
        "note": "LLM-as-judge scores require manual spot-checking; these results are not a substitute for factual review.",
    }


    output_path = Path(args.output)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

    if args.version:
        filename = f"{output_path.stem}_{args.version}_{timestamp}{output_path.suffix}"
    else:
        filename = f"{output_path.stem}_{timestamp}{output_path.suffix}"

    versioned_output = output_path.with_name(filename)

    versioned_output.parent.mkdir(parents=True, exist_ok=True)

    versioned_output.write_text(
        json.dumps(output, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


    # Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    # Path(args.output).write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"case_count": len(raw), "summary": summary, "latency_ms": output["latency_ms"], "output": args.output}, indent=2))


if __name__ == "__main__":
    main()
