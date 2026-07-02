from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


SOURCE_DIR = Path(
    "/Users/babbitt0910/Library/CloudStorage/GoogleDrive-babbitt0910@gmail.com/"
    "我的雲端硬碟/八番炸 歷年交易明細/excel檔"
)
OUTPUT_DIR = Path("/Users/babbitt0910/Documents/Codex/2026-06-12/google/outputs/posky-dashboard")
OUTPUT_FILE = OUTPUT_DIR / "data.json"


def clean_text(value) -> str:
    if pd.isna(value):
        return ""
    return str(value).strip()


def number_series(df: pd.DataFrame, column: str) -> pd.Series:
    return pd.to_numeric(df.get(column, 0), errors="coerce").fillna(0)


def source_files() -> list[Path]:
    files = [*SOURCE_DIR.glob("*.xlsx"), *SOURCE_DIR.glob("*.csv")]
    return sorted(files, key=lambda path: path.name)


def read_csv(file: Path) -> pd.DataFrame:
    for encoding in ("utf-8-sig", "utf-8", "cp950", "big5"):
        try:
            return pd.read_csv(file, encoding=encoding)
        except UnicodeDecodeError:
            continue
    return pd.read_csv(file)


def main() -> None:
    frames: list[pd.DataFrame] = []
    files = source_files()
    for file in files:
        if file.suffix.lower() == ".csv":
            frame = read_csv(file)
            frame["來源檔案"] = file.name
            frame["來源工作表"] = "CSV"
            frames.append(frame)
            continue

        workbook = pd.ExcelFile(file)
        for sheet_name in workbook.sheet_names:
            frame = pd.read_excel(file, sheet_name=sheet_name)
            frame["來源檔案"] = file.name
            frame["來源工作表"] = sheet_name
            frames.append(frame)

    if not frames:
        raise SystemExit(f"No source files found in {SOURCE_DIR}")

    df = pd.concat(frames, ignore_index=True)
    df["結帳時間"] = pd.to_datetime(df["結帳時間"], errors="coerce")
    df["建立時間"] = pd.to_datetime(df["建立時間"], errors="coerce")

    for column in [
        "單價",
        "數量",
        "商品總金額",
        "訂單總金額",
        "實收金額",
        "找零",
        "商品折扣(-$)",
        "商品折扣(-%)",
        "整筆訂單折扣(-$)",
        "整筆訂單折扣(-%)",
        "服務費",
        "運費",
    ]:
        df[column] = number_series(df, column)

    df = df[df["結帳時間"].notna()].copy()
    df["date"] = df["結帳時間"].dt.strftime("%Y-%m-%d")
    df["month"] = df["結帳時間"].dt.strftime("%Y-%m")
    df["hour"] = df["結帳時間"].dt.hour.astype(int)
    df["weekday"] = df["結帳時間"].dt.dayofweek.astype(int)
    df["weekdayName"] = df["結帳時間"].dt.day_name()

    orders_df = (
        df[df["訂單總金額"] > 0]
        .sort_values("結帳時間")
        .drop_duplicates("訂單編號", keep="first")
        .copy()
    )
    items_df = df[df["商品總金額"] > 0].copy()
    upsizes_df = df[df["附加屬性"].fillna("").astype(str).str.strip().eq("大份")].copy()

    orders = []
    for row in orders_df.itertuples(index=False):
        orders.append(
            {
                "id": clean_text(getattr(row, "訂單編號")),
                "checkout": row.結帳時間.isoformat(),
                "date": row.date,
                "month": row.month,
                "hour": int(row.hour),
                "weekday": int(row.weekday),
                "weekdayName": row.weekdayName,
                "table": clean_text(getattr(row, "桌位名稱")),
                "payment": clean_text(getattr(row, "付款方式")),
                "source": clean_text(getattr(row, "訂單來源")),
                "cashier": clean_text(getattr(row, "結帳員工")),
                "staff": clean_text(getattr(row, "點餐員工")),
                "status": clean_text(getattr(row, "訂單狀態")),
                "orderTotal": float(row.訂單總金額),
                "received": float(row.實收金額),
                "file": clean_text(row.來源檔案),
            }
        )

    items = []
    for row in items_df.itertuples(index=False):
        items.append(
            {
                "orderId": clean_text(getattr(row, "訂單編號")),
                "checkout": row.結帳時間.isoformat(),
                "date": row.date,
                "month": row.month,
                "hour": int(row.hour),
                "weekday": int(row.weekday),
                "category": clean_text(getattr(row, "商品類型")),
                "product": clean_text(getattr(row, "商品")),
                "attribute": clean_text(getattr(row, "附加屬性")),
                "unitPrice": float(row.單價),
                "quantity": float(row.數量),
                "itemTotal": float(row.商品總金額),
                "payment": clean_text(getattr(row, "付款方式")),
                "source": clean_text(getattr(row, "訂單來源")),
                "cashier": clean_text(getattr(row, "結帳員工")),
                "table": clean_text(getattr(row, "桌位名稱")),
            }
        )

    upsizes = []
    for row in upsizes_df.itertuples(index=False):
        extra_amount = float(row.單價) * float(row.數量)
        upsizes.append(
            {
                "orderId": clean_text(getattr(row, "訂單編號")),
                "checkout": row.結帳時間.isoformat(),
                "date": row.date,
                "month": row.month,
                "hour": int(row.hour),
                "weekday": int(row.weekday),
                "category": clean_text(getattr(row, "商品類型")),
                "product": clean_text(getattr(row, "商品")),
                "attribute": clean_text(getattr(row, "附加屬性")),
                "extraUnitPrice": float(row.單價),
                "quantity": float(row.數量),
                "extraRevenue": extra_amount,
                "payment": clean_text(getattr(row, "付款方式")),
                "source": clean_text(getattr(row, "訂單來源")),
                "cashier": clean_text(getattr(row, "結帳員工")),
                "table": clean_text(getattr(row, "桌位名稱")),
            }
        )

    meta = {
        "generatedAt": pd.Timestamp.now().isoformat(),
        "sourceFolder": str(SOURCE_DIR),
        "files": [file.name for file in files],
        "rowCount": int(len(df)),
        "orderCount": int(len(orders)),
        "itemRowCount": int(len(items)),
        "upsizeRowCount": int(len(upsizes)),
        "dateMin": min(order["date"] for order in orders),
        "dateMax": max(order["date"] for order in orders),
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(
        json.dumps({"meta": meta, "orders": orders, "items": items, "upsizes": upsizes}, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
