import { google } from "googleapis";

function getPrivateKey() {
  const k = process.env.GOOGLE_PRIVATE_KEY;
  if (!k) throw new Error("Missing GOOGLE_PRIVATE_KEY");
  // 環境変数に \n で入れた場合、実際の改行に戻す
  return k.replace(/\\n/g, "\n");
}

export async function GET() {
  try {
    const folderId = process.env.DRIVE_FOLDER_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    if (!folderId) throw new Error("Missing DRIVE_FOLDER_ID");
    if (!clientEmail) throw new Error("Missing GOOGLE_CLIENT_EMAIL");

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: getPrivateKey(),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id,name,mimeType,modifiedTime,size)",
      orderBy: "modifiedTime desc",
    });


    const files = (res.data.files ?? []).map((f) => ({
  id: f.id,
  name: f.name,
  mimeType: f.mimeType,
  modifiedTime: f.modifiedTime ? new Date(f.modifiedTime).toLocaleString("ja-JP") : null,
  size: f.size ? Number(f.size) : null,
}));

return Response.json(
  { files },
  { headers: { "Content-Type": "application/json; charset=utf-8" } }
);
    return Response.json({ files: res.data.files ?? [] });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}