"use client";

import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

type DriveFileRow = {
  id: string;
  name: string;
  mimeType?: string;
  modifiedTime?: string;
  size?: string;
};

const columns: GridColDef<DriveFileRow>[] = [
  { field: "name", headerName: "ファイル名", flex: 1, minWidth: 200 },
  { field: "modifiedTime", headerName: "更新日時", width: 220 },
  { field: "size", headerName: "サイズ", width: 120 },
  { field: "mimeType", headerName: "種類", width: 260 },
];

export default function Home() {
  const [rows, setRows] = React.useState<DriveFileRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/drive/files");
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        setRows(data.files ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Driveファイル一覧</h1>

      {error && (
        <p style={{ color: "red" }}>
          エラー: {error}
        </p>
      )}

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
        />
      </div>
    </div>
  );
}