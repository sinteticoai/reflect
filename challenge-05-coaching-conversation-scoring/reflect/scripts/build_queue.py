# Builds public/queue/*.json from cached synthetic-call analyses (scripts/out/cache).
import csv, glob, json, os, re, sys
OUT = "public/queue"
os.makedirs(OUT, exist_ok=True)
calls = {r["call_id"]: r for r in csv.DictReader(open("../data/synthetic_data/synthetic_calls.csv"))}
coaches = {r["coach_id"]: r for r in csv.DictReader(open("../data/synthetic_data/synthetic_coaches.csv"))}
parts = {r["participant_id"]: r for r in csv.DictReader(open("../data/synthetic_data/synthetic_participants.csv"))}
want = {}
for f in glob.glob("scripts/out/cache/claude-haiku-5-5__syn_CALL*.json"):
    want[re.search(r"(CALL\d+)", f).group(1)] = f
lines = {}
for r in csv.DictReader(open("../data/synthetic_data/synthetic_call_transcripts.csv")):
    if r["call_id"] in want:
        lines.setdefault(r["call_id"], []).append(
            {"line_number": int(r["line_number"]), "speaker": r["speaker"], "text": r["text"], "time": r["time_in_call"]})
index = []
for cid, f in want.items():
    a = json.load(open(f))
    for k in ("tags", "flags", "score"):
        if isinstance(a.get(k), str):
            a[k] = json.loads(a[k])
    c = calls.get(cid, {})
    flags = a.get("flags") or []
    urgent = [x for x in flags if x.get("severity") == "urgent"]
    sc = a.get("score") or {}
    p = parts.get(c.get("participant_id", ""), {})
    item = {
        "id": cid,
        "date": c.get("date", ""),
        "language": c.get("language", ""),
        "topic": c.get("goal_topic", ""),
        "coach": coaches.get(c.get("coach_id", ""), {}).get("first_name", ""),
        "participant": p.get("first_name", ""),
        "urgent": len(urgent),
        "urgent_reason": urgent[0]["reason"] if urgent else "",
        "review": len(flags) - len(urgent),
        "overall": sc.get("overall_1_to_5"),
        "summary": sc.get("summary", ""),
    }
    index.append(item)
    json.dump({"id": cid, "title": f"{cid} · {item['coach']} with {item['participant']}", "language": item["language"],
               "lines": sorted(lines.get(cid, []), key=lambda l: l["line_number"]), "analysis": a},
              open(f"{OUT}/{cid}.json", "w"), ensure_ascii=False)
index.sort(key=lambda x: (-x["urgent"], x["overall"] or 9, -x["review"]))
json.dump(index, open(f"{OUT}/index.json", "w"), ensure_ascii=False)
print(len(index), "calls,", sum(1 for x in index if x["urgent"]), "urgent")
