param(
    [string]$StudentCode = "QE200047",
    [string]$FullName = "Dinh Thanh Trung",
    [string]$GithubUrl = "https://github.com/TrungDinh15/PE-FER202",
    [string]$VercelUrl = "https://pe-fer-202-sable.vercel.app",
    [string]$SupabaseUrl = "https://rkxuzvbffrsvzfuouoec.supabase.co",
    [string]$SupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJreHV6dmJmZnJzdnpmdW91b2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MDE5NDEsImV4cCI6MjEwOTI3Nzk0MX0.ShrPG4D0yKu1KrPJDWnW5507wqWoG5KwsZcoPzyDDiM"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$baseDir = (Resolve-Path "$PSScriptRoot\..").Path
$subDir = Join-Path $baseDir $StudentCode
$zipPath = Join-Path $subDir "$StudentCode.zip"
$docxPath = Join-Path $subDir "$StudentCode.docx"

if (!(Test-Path $subDir)) {
    New-Item -ItemType Directory -Path $subDir | Out-Null
}

Write-Host "Creating zip at $zipPath..."
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$allowedTopFiles = @(
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "next.config.ts",
    "next-env.d.ts",
    "eslint.config.mjs",
    "components.json",
    ".env.example"
)

$allowedDirs = @(
    "app",
    "components",
    "context",
    "lib",
    "public",
    "supabase"
)

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

try {
    foreach ($f in $allowedTopFiles) {
        $full = Join-Path $baseDir $f
        if (Test-Path $full) {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $full, $f) | Out-Null
            Write-Host "  Added file: $f"
        }
    }

    foreach ($d in $allowedDirs) {
        $dirFull = Join-Path $baseDir $d
        if (Test-Path $dirFull) {
            Get-ChildItem -Path $dirFull -Recurse -File | ForEach-Object {
                $rel = $_.FullName.Substring($baseDir.Length + 1).Replace("\", "/")
                # Safety checks
                if ($rel -notmatch "node_modules|\.next|\.git") {
                    if ($_.Name -notmatch "^\.env" -or $_.Name -eq ".env.example") {
                        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel) | Out-Null
                        Write-Host "  Added: $rel"
                    }
                }
            }
        }
    }
} finally {
    $zip.Dispose()
}

Write-Host "Zip created successfully."

Write-Host "Creating Word docx at $docxPath..."
if (Test-Path $docxPath) { Remove-Item $docxPath -Force }

$contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
'@

$rels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
'@

$testEmail = "grader.$($StudentCode.ToLower())@example.com"
$testPassword = "Test1234!"

$lines = @(
    "Student Code: $StudentCode",
    "Full Name: $FullName",
    "GitHub Repository URL: $GithubUrl",
    "Vercel Production URL: $VercelUrl",
    "Supabase Project URL: $SupabaseUrl",
    "Supabase anon (public) key: $SupabaseAnonKey",
    "Test account email: $testEmail",
    "Test account password: $testPassword"
)

$pXmls = foreach ($line in $lines) {
@"
    <w:p>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:sz w:val="24"/>
        </w:rPr>
        <w:t>$line</w:t>
      </w:r>
    </w:p>
"@
}

$paragraphs = $pXmls -join "`n"

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
$paragraphs
  </w:body>
</w:document>
"@

$docZip = [System.IO.Compression.ZipFile]::Open($docxPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    $e1 = $docZip.CreateEntry("[Content_Types].xml")
    $s1 = $e1.Open()
    $w1 = New-Object System.IO.StreamWriter($s1, [System.Text.Encoding]::UTF8)
    $w1.Write($contentTypes)
    $w1.Flush()
    $w1.Close()

    $e2 = $docZip.CreateEntry("_rels/.rels")
    $s2 = $e2.Open()
    $w2 = New-Object System.IO.StreamWriter($s2, [System.Text.Encoding]::UTF8)
    $w2.Write($rels)
    $w2.Flush()
    $w2.Close()

    $e3 = $docZip.CreateEntry("word/document.xml")
    $s3 = $e3.Open()
    $w3 = New-Object System.IO.StreamWriter($s3, [System.Text.Encoding]::UTF8)
    $w3.Write($documentXml)
    $w3.Flush()
    $w3.Close()
} finally {
    $docZip.Dispose()
}

Write-Host "Docx created successfully at $docxPath"
Write-Host "`n=== VERIFYING SUBMISSION FOLDER ==="
Get-ChildItem -Path $subDir | Format-Table Name, Length, LastWriteTime

