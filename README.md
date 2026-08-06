# RM Mail Merge Tools

> Office Web Add-in for Microsoft Word — split, convert, compress, and combine PDF files directly from the Word task pane.

<div align="center">

<img src="https://img.shields.io/badge/Platform-Microsoft_Word-2B579A?style=flat-square&logo=microsoftword&logoColor=white" alt="Platform" />
<img src="https://img.shields.io/badge/Type-Office_Add--in-2B579A?style=flat-square&logo=microsoftoffice&logoColor=white" alt="Type" />
<img src="https://img.shields.io/badge/License-Proprietary-D4A017?style=flat-square&logo=gnu&logoColor=white" alt="License" />
<a href="https://github.com/rifqimulyawan/rm-mail-merge-tools/releases"><img src="https://img.shields.io/github/v/release/rifqimulyawan/rm-mail-merge-tools?style=flat-square&color=2B579A&label=Latest%20Release" alt="Release" /></a>

</div>

---

## Features

| Feature | Description |
|---------|-------------|
| **Mail Merge** | Merge data from Excel/CSV into Word templates with one click |
| **Batch Convert** | Convert multiple DOCX files to PDF simultaneously |
| **PDF Combine** | Merge multiple PDF files into one |
| **PDF Compress** | Compress PDF file size for email delivery |
| **Filename prefix/suffix** | Custom naming for output files |
| **Remove blank fields** | Automatically remove empty fields during merge |
| **Guide popup** | Built-in usage guide inside the add-in |
| **Settings panel** | Configure output directory, naming, and behavior |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Platform | Microsoft Office Web Add-in |
| Integration | Office.js (Office Web Add-in API) |
| Hosting | Remote server (no local dependencies required) |

---

## Installation

### Easy Way — Installer (.exe / .pkg)

Download the installer from the [Releases page](https://github.com/rifqimulyawan/rm-mail-merge-tools/releases), then:

1. Run the installer
2. Restart Microsoft Word
3. Go to **Insert > My Add-ins**
4. Find **RM Mail Merge Tools** in the Developer Add-ins tab, or click **Upload My Add-in** and select `manifest.xml`

No Node.js or technical knowledge required. The web app is hosted on a server — the installer only registers the manifest to Word.

---

## Build macOS Installer

macOS `.pkg` installer is built automatically via GitHub Actions on tag push `v*`:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Or trigger manually from the **Actions** tab on GitHub. Download `.pkg` from Actions > Artifacts.

---

## License

© RM Digital — All rights reserved

## Developer

**RM Digital** — [rmdigital.co.id](https://rmdigital.co.id)
