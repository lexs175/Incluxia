$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Get-Location).Path)
$archiveRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot 'archive/inactive-pages'))
$projectPrefix = $projectRoot.TrimEnd('\') + '\'
if (-not $archiveRoot.StartsWith($projectPrefix, [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Archive must remain inside the project.' }
$relativeFiles = @('src/pages/nosotros.astro', 'src/components/home/HomeBlog.astro', 'src/components/cards/BlogCard.astro', 'src/data/articles.json')
foreach ($directory in @('src/pages/blog', 'src/components/blog', 'src/components/nosotros', 'public/images/blog')) {
  foreach ($file in Get-ChildItem -LiteralPath (Join-Path $projectRoot $directory) -Recurse -File) {
    $relativeFiles += [System.IO.Path]::GetRelativePath($projectRoot, $file.FullName)
  }
}
$entries = foreach ($relative in $relativeFiles) {
  $sourcePath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $relative))
  $destinationPath = [System.IO.Path]::GetFullPath((Join-Path $archiveRoot $relative))
  if (-not $sourcePath.StartsWith($projectPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or -not $destinationPath.StartsWith($archiveRoot + '\', [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Path escapes the intended project folders.' }
  if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Missing source: $relative" }
  if (Test-Path -LiteralPath $destinationPath) { throw "Archive already contains: $relative" }
  [PSCustomObject]@{ relativePath = $relative.Replace('\', '/'); source = $sourcePath; destination = $destinationPath; sha256 = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash }
}
foreach ($entry in $entries) {
  $null = New-Item -ItemType Directory -Path ([System.IO.Path]::GetDirectoryName($entry.destination)) -Force
  Move-Item -LiteralPath $entry.source -Destination $entry.destination
  if ((Get-FileHash -LiteralPath $entry.destination -Algorithm SHA256).Hash -ne $entry.sha256) { throw "Changed content: $($entry.relativePath)" }
}
$entries | Select-Object relativePath, sha256 | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $archiveRoot 'manifest.json') -Encoding utf8
Write-Output "Archived $($entries.Count) files; all SHA256 hashes match."
