// const { createClient } = require("@supabase/supabase-js");
// // 🔐 Replace these with your Supabase credentials
// const SUPABASE_URL = "https://slfvocwmteuhxzouwelw.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZnZvY3dtdGV1aHh6b3V3ZWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDYxNjEsImV4cCI6MjA2NTEyMjE2MX0.vD_lMge76UszJRVoShf8gCZZyI_f3mpRnjwIgiSxMcM";
//  // Use Service Role key only in backend scripts
// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// async function fixGoogleDriveLinks() {
//   console.log("🔍 Checking student resume URLs...");

//   const { data: students, error } = await supabase
//     .from("students")
//     .select("id, full_name, resume_url");

//   if (error) {
//     console.error("❌ Error fetching students:", error.message);
//     return;
//   }

//   let updatedCount = 0;

//   for (const s of students) {
//     const url = s.resume_url?.trim();

//     // Skip if no URL
//     if (!url) continue;

//     // ✅ Only process Google Drive links
//     if (url.includes("drive.google.com")) {
//       const match = url.match(/\/d\/(.*?)\//);
//       if (match && match[1]) {
//         const fileId = match[1];
//         const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;

//         // Skip if already correct
//         if (url === previewUrl) continue;

//         // 🛠 Update in Supabase
//         const { error: updateError } = await supabase
//           .from("students")
//           .update({ resume_url: previewUrl })
//           .eq("id", s.id);

//         if (updateError) {
//           console.error(`⚠️ Error updating ${s.full_name}:`, updateError.message);
//         } else {
//           updatedCount++;
//           console.log(`✅ Updated: ${s.full_name}`);
//         }
//       }
//     }
//   }

//   console.log(`🎉 Drive link fix complete — ${updatedCount} records updated.`);
// }

// fixGoogleDriveLinks();
