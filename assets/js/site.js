/* ============================================================
   Tools360Pro — shared site script
   Header/footer injection · Ctrl+K palette · favourites/recent
   (localStorage) · related tools · theme · T360 helpers
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Registry ---------- */
  var CATEGORIES = [
    { id: "pdf",         name: "PDF Tools",    tagline: "Merge, split and build PDFs" },
    { id: "image",       name: "Image Tools",  tagline: "Compress, resize and convert images" },
    { id: "ai",          name: "AI Tools",     tagline: "Backgrounds, upscaling, OCR and more" },
    { id: "text",        name: "Text Tools",   tagline: "Count, convert and clean up text" },
    { id: "converters",  name: "Converters",   tagline: "Units, bases, time zones and more" },
    { id: "calculators", name: "Calculators",  tagline: "Percentages, age, BMI, loans and tips" },
    { id: "developer",   name: "Developer Tools", tagline: "JSON, Base64, JWT, CSS and regex" },
    { id: "generators",  name: "Generators",   tagline: "QR codes, passwords and palettes" }
  ];

  function ic(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>"; }
  var ICONS = {
    "merge-pdf":        ic('<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M12 8v8"/><path d="M8.5 12h7"/>'),
    "split-pdf":        ic('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16" stroke-dasharray="3.5 3.5"/>'),
    "images-to-pdf":    ic('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15.5 16 10.5 5 21"/>'),
    "compress-image":   ic('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v4H5"/><path d="M15 3v4h4"/><path d="M9 21v-4H5"/><path d="M15 21v-4h4"/>'),
    "resize-image":     ic('<rect x="3" y="6" width="13" height="13" rx="2"/><path d="M16 3h5v5"/><path d="M21 3l-6.5 6.5"/>'),
    "convert-image":    ic('<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>'),
    "heic-to-jpg":      ic('<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>'),
    "background-remover": ic('<circle cx="12" cy="8" r="3.6"/><path d="M5.5 20c.8-3.4 3.4-5 6.5-5s5.7 1.6 6.5 5"/>'),
    "ai-image-upscaler": ic('<path d="M15 3h6v6"/><path d="M21 3l-7 7"/><path d="M9 21H3v-6"/><path d="M3 21l7-7"/><path d="M17.8 13.4l.45 1.2 1.2.45-1.2.45-.45 1.2-.45-1.2-1.2-.45 1.2-.45z"/>'),
    "word-counter":     ic('<path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h7"/><path d="M17.5 15.5v5"/><path d="M15 18h5"/>'),
    "case-converter":   ic('<text x="4" y="17" font-size="13" font-weight="700" fill="currentColor" stroke="none" font-family="inherit">Aa</text><path d="M16 8h5"/><path d="M18.5 5.5 21 8l-2.5 2.5"/>'),
    "unit-converter":   ic('<rect x="2" y="9" width="20" height="6" rx="1.5"/><path d="M6 9v3.2"/><path d="M10 9v3.2"/><path d="M14 9v3.2"/><path d="M18 9v3.2"/>'),
    "percentage-calculator": ic('<circle cx="7" cy="7" r="3.2"/><circle cx="17" cy="17" r="3.2"/><path d="M18.5 4.5 5.5 19.5"/>'),
    "age-calculator":   ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/><circle cx="12" cy="15.5" r="1.4"/>'),
    "bmi-calculator":   ic('<path d="M3 12h4l2.2-5.5 4 11 2.3-5.5H21"/>'),
    "json-formatter":   ic('<path d="M8.5 4C6.6 4 5.5 5 5.5 7v2.6c0 1.2-.5 1.9-1.7 2.4 1.2.5 1.7 1.2 1.7 2.4V17c0 2 1.1 3 3 3"/><path d="M15.5 4c1.9 0 3 1 3 3v2.6c0 1.2.5 1.9 1.7 2.4-1.2.5-1.7 1.2-1.7 2.4V17c0 2-1.1 3-3 3"/>'),
    "base64":           ic('<path d="M8.5 6 3.5 12l5 6"/><path d="M15.5 6l5 6-5 6"/>'),
    "uuid-generator":   ic('<circle cx="8" cy="15.5" r="4.5"/><path d="M11.2 12.3 20 3.5"/><path d="M16.8 4.6l3 3"/><path d="M14 7.4l2.2 2.2"/>'),
    "qr-code-generator": ic('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3z"/><path d="M21 14v1"/><path d="M14 21h1"/><path d="M18.5 18.5H21V21h-2.5z"/>'),
    "password-generator": ic('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="15.5" r="1.4"/>'),
    "pdf-to-image":     ic('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><circle cx="11" cy="13" r="1.6"/><path d="M19 18.5 15.8 15.2 8.5 21"/>'),
    "rotate-pdf":       ic('<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8"/><path d="M20 3v5h-5"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 16"/><path d="M4 21v-5h5"/>'),
    "compress-pdf":     ic('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M12 17.5v-5"/><path d="M9.6 14.6 12 17l2.4-2.4"/>'),
    "crop-image":       ic('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'),
    "watermark-image":  ic('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8.2s3.2 3.4 3.2 5.6a3.2 3.2 0 1 1-6.4 0C8.8 11.6 12 8.2 12 8.2z"/>'),
    "favicon-generator": ic('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7.2l1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4L7.1 10.8l3.4-.5z"/>'),
    "keyword-density":  ic('<path d="M5 20v-6"/><path d="M11 20V6"/><path d="M17 20v-9"/><path d="M3 20h18"/>'),
    "meta-tag-generator": ic('<path d="M12.6 2.9 21 11.3a2 2 0 0 1 0 2.8l-7.2 7.2a2 2 0 0 1-2.8 0L2.6 13A2 2 0 0 1 2 11.6V4a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.9z"/><circle cx="7.5" cy="7.5" r="1.3"/>'),
    "lorem-ipsum":      ic('<path d="M15 4v16"/><path d="M10 4v16"/><path d="M15 4h-4.5a3.5 3.5 0 1 0 0 7H15"/>'),
    "text-cleaner":     ic('<path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>'),
    "image-to-text":    ic('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h6"/><path d="M7 12h10"/><path d="M7 16h8"/>'),
    "citation-generator": ic('<path d="M5.5 5.5h5.5v6c0 3-1.4 4.8-3.8 5.8"/><path d="M13.5 5.5H19v6c0 3-1.4 4.8-3.8 5.8"/>'),
    "time-zone-converter": ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15.2 15.2 0 0 1 0 18"/><path d="M12 3a15.2 15.2 0 0 0 0 18"/>'),
    "number-base-converter": ic('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8.5 16v-8"/><path d="M6.7 9.6 8.5 8l1.8 1.6"/><circle cx="15.5" cy="12" r="3.4"/>'),
    "currency-converter": ic('<path d="M12 2.5v19"/><path d="M16.8 6.4c-.9-1.1-2.6-1.7-4.8-1.7-2.9 0-4.7 1.4-4.7 3.4 0 4.7 9.6 2.5 9.6 7 0 2-2 3.3-4.9 3.3-2.3 0-4.1-.7-5-2"/>'),
    "loan-calculator":  ic('<path d="M3 9.5 12 4l9 5.5"/><path d="M4.5 10v7.5"/><path d="M9.3 10v7.5"/><path d="M14.7 10v7.5"/><path d="M19.5 10v7.5"/><path d="M2.5 21h19"/><path d="M2.5 17.5h19"/>'),
    "tip-calculator":   ic('<path d="M6 2.5h12V22l-2-1.4L14 22l-2-1.4L10 22l-2-1.4L6 22z"/><path d="M9.5 8h5"/><path d="M9.5 12h5"/>'),
    "url-encode":       ic('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'),
    "jwt-decoder":      ic('<path d="M12 2 4 5.5V11c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5.5z"/><path d="M9 11.6 11.2 14 15.2 9.6"/>'),
    "css-gradient-generator": ic('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 16.5 16.5 3"/><path d="M3 11 11 3"/><path d="M3 5.8 5.8 3"/>'),
    "regex-tester":     ic('<path d="M12 4v9"/><path d="M5.8 6.5l12.4 6"/><path d="M18.2 6.5l-12.4 6"/><circle cx="5.5" cy="18.5" r="1.6"/>'),
    "color-palette":    ic('<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.9 0-1.2-1-1.7-1-2.9 0-1 .8-1.7 2-1.7h2.1A3.9 3.9 0 0 0 21 10.6C20.6 6.4 16.6 3 12 3z"/><circle cx="7.5" cy="10.5" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="16.5" cy="10.5" r="1.2"/>'),
    "list-randomizer":  ic('<path d="M3 7h4l10 10h4"/><path d="M19 14.5 21.5 17 19 19.5"/><path d="M3 17h4l2.6-2.6"/><path d="M13.4 9.4 17 7h4"/><path d="M19 4.5 21.5 7 19 9.5"/>'),
    "invoice-generator": ic('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><text x="9.2" y="17.5" font-size="10" font-weight="700" fill="currentColor" stroke="none" font-family="inherit">$</text>'),
    "screen-recorder":  ic('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>'),
    "mp4-to-mp3":       ic('<path d="M9 18V6l10-2v11"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="15" r="2.5"/>'),
    "pdf-to-word":      ic('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><text x="8.4" y="17.5" font-size="9.5" font-weight="700" fill="currentColor" stroke="none" font-family="inherit">W</text>'),
    "random-number-generator": ic('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.3" fill="currentColor" stroke="none"/>'),
    "timestamp-converter": ic('<path d="M4.9 8.2A8.5 8.5 0 1 1 3.6 13"/><path d="M3.4 4.6v4h4"/><path d="M12 8v4.2l3 1.8"/>'),
    "diff-checker": ic('<path d="M8 3H5.5A1.5 1.5 0 0 0 4 4.5v15A1.5 1.5 0 0 0 5.5 21H8M16 3h2.5A1.5 1.5 0 0 1 20 4.5v15a1.5 1.5 0 0 1-1.5 1.5H16"/><path d="M12 3v18"/>'),
    "hash-generator": ic('<path d="M9.5 3.5L7.5 20.5M16.5 3.5l-2 17M4 9h17M3 15.5h17"/>'),
    "youtube-thumbnail-downloader": ic('<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M10.3 9.7v4.6l4.2-2.3z" fill="currentColor" stroke="none"/>'),
    "voice-recorder": ic('<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.8 11.5a6.2 6.2 0 0 0 12.4 0M12 17.7V21M9 21h6"/>'),
    "meme-generator": ic('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9.5h10M7 15.5h6"/>'),
    "text-to-handwriting": ic('<path d="M4 20l.8-3.8L16.6 4.4a2 2 0 0 1 2.9 0l.1.1a2 2 0 0 1 0 2.9L7.8 19.2z"/><path d="M14.8 6.2l2.9 2.9"/>'),
    "date-calculator": ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    "compound-interest-calculator": ic('<path d="M4 4v16h16"/><path d="M7.5 15.5l3.8-4.8 3 2.8 4.7-6"/><path d="M15.3 7.5H19V11"/>'),
    "gpa-calculator": ic('<path d="M2.5 9.3L12 5l9.5 4.3L12 13.6z"/><path d="M6.4 11.4v4.1c0 1.3 2.5 2.6 5.6 2.6s5.6-1.3 5.6-2.6v-4.1M21.5 9.3v4.7"/>'),
    "soon":             ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    "popular":          ic('<path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1-5.4-3-5.4 3 1.1-6.1L3.2 9.4l6.1-.8z"/>')
  };

  var TOOLS = [
    /* PDF */
    { slug: "merge-pdf",        name: "Merge PDF",        cat: "pdf", desc: "Combine several PDF files into a single document." },
    { slug: "split-pdf",        name: "Split PDF",        cat: "pdf", desc: "Extract a page range or split a PDF into separate files." },
    { slug: "images-to-pdf",    name: "Images to PDF",    cat: "pdf", desc: "Turn JPG, PNG and WebP images into one PDF document." },
    { slug: "pdf-to-image",     name: "PDF to Image",     cat: "pdf", desc: "Render PDF pages as JPG or PNG images." },
    { slug: "rotate-pdf",       name: "Rotate & Organize PDF", cat: "pdf", desc: "Rotate, reorder and delete PDF pages." },
    { slug: "compress-pdf",     name: "Compress PDF",     cat: "pdf", desc: "Shrink a PDF by re-encoding its images." },
    /* Image */
    { slug: "compress-image",   name: "Compress Image",   cat: "image", desc: "Reduce JPG, PNG and WebP file size with a quality slider." },
    { slug: "resize-image",     name: "Resize Image",     cat: "image", desc: "Change image dimensions by pixels or percentage." },
    { slug: "convert-image",    name: "Convert Image",    cat: "image", desc: "Convert images between JPG, PNG and WebP formats." },
    { slug: "heic-to-jpg",      name: "HEIC to JPG Converter", cat: "image", desc: "Convert iPhone HEIC photos to JPG or PNG, no uploads." },
    { slug: "background-remover", name: "Background Remover", cat: "ai", desc: "Remove image backgrounds with AI, right in your browser." },
    { slug: "ai-image-upscaler", name: "AI Image Upscaler", cat: "ai", desc: "Upscale images 2x or 4x with AI, right in your browser." },
    { slug: "crop-image",       name: "Crop Image",       cat: "image", desc: "Crop images with a visual box and aspect presets." },
    { slug: "watermark-image",  name: "Watermark Image",  cat: "image", desc: "Stamp text watermarks onto your images." },
    { slug: "favicon-generator", name: "Favicon Generator", cat: "image", desc: "Generate favicon sizes and an ICO from one image." },
    /* Text */
    { slug: "word-counter",     name: "Word Counter",     cat: "text", desc: "Count words, characters, sentences and reading time." },
    { slug: "case-converter",   name: "Case Converter",   cat: "text", desc: "Switch text between UPPER, lower, Title, camelCase and more." },
    { slug: "keyword-density",  name: "Keyword Density Checker", cat: "text", desc: "See how often words and phrases repeat in your text." },
    { slug: "meta-tag-generator", name: "Meta Tag Generator", cat: "text", desc: "Build meta, Open Graph and Twitter Card tags with preview." },
    { slug: "lorem-ipsum",      name: "Lorem Ipsum Generator", cat: "text", desc: "Generate placeholder paragraphs, sentences or words." },
    { slug: "text-cleaner",     name: "Text Cleaner",     cat: "text", desc: "Clean up text: extra spaces, line breaks, duplicates and accents." },
    { slug: "image-to-text",    name: "Image to Text (OCR)", cat: "ai", desc: "Extract text from images and scans with OCR, in your browser." },
    { slug: "citation-generator", name: "Citation Generator (APA & MLA)", cat: "text", desc: "Format APA 7 and MLA 9 references and in-text citations." },
    /* Converters */
    { slug: "unit-converter",   name: "Unit Converter",   cat: "converters", desc: "Convert length, weight, temperature, area, speed and more." },
    { slug: "time-zone-converter", name: "Time Zone Converter", cat: "converters", desc: "Convert times between world time zones." },
    { slug: "number-base-converter", name: "Number Base Converter", cat: "converters", desc: "Convert between binary, decimal, octal and hex." },
    { slug: "currency-converter", name: "Currency Converter", cat: "converters", desc: "Convert currencies with daily exchange rates." },
    /* Calculators */
    { slug: "percentage-calculator", name: "Percentage Calculator", cat: "calculators", desc: "Find percentages, ratios and percentage change." },
    { slug: "age-calculator",   name: "Age Calculator",   cat: "calculators", desc: "Calculate exact age in years, months and days." },
    { slug: "bmi-calculator",   name: "BMI Calculator",   cat: "calculators", desc: "Check your body mass index and healthy weight range." },
    { slug: "loan-calculator",  name: "Loan / EMI Calculator", cat: "calculators", desc: "Monthly payments plus a full amortisation table." },
    { slug: "tip-calculator",   name: "Tip & Bill Split Calculator", cat: "calculators", desc: "Work out the tip and split the bill fairly." },
    /* Developer */
    { slug: "json-formatter",   name: "JSON Formatter & Validator", cat: "developer", desc: "Format, minify and validate JSON with clear errors." },
    { slug: "base64",           name: "Base64 Encoder & Decoder", cat: "developer", desc: "Encode and decode Base64 text and files, Unicode-safe." },
    { slug: "uuid-generator",   name: "UUID Generator",   cat: "developer", desc: "Generate random v4 UUIDs, one or in bulk." },
    { slug: "url-encode",       name: "URL & HTML Encoder", cat: "developer", desc: "Encode and decode URLs and HTML entities." },
    { slug: "jwt-decoder",      name: "JWT Decoder",      cat: "developer", desc: "Inspect JWT headers and payloads in your browser." },
    { slug: "css-gradient-generator", name: "CSS Gradient & Shadow Generator", cat: "developer", desc: "Design gradients and box shadows with live preview." },
    { slug: "regex-tester",     name: "Regex Tester",     cat: "developer", desc: "Test regular expressions with highlighted matches." },
    /* Generators */
    { slug: "qr-code-generator", name: "QR Code Generator", cat: "generators", desc: "Create QR codes for links and text, download PNG or SVG." },
    { slug: "password-generator", name: "Password Generator", cat: "generators", desc: "Generate strong random passwords with a strength meter." },
    { slug: "color-palette",    name: "Color Converter & Palette", cat: "generators", desc: "Convert HEX, RGB and HSL and build colour palettes." },
    { slug: "list-randomizer",  name: "List Randomizer",  cat: "generators", desc: "Shuffle lists and pick random winners." },
    { slug: "invoice-generator", name: "Invoice Generator", cat: "generators", desc: "Create professional PDF invoices with items, tax and totals." },
    { slug: "screen-recorder",  name: "Screen Recorder",  cat: "generators", desc: "Record your screen, window or tab and download the video." },
    { slug: "mp4-to-mp3",       name: "MP4 to MP3 Converter", cat: "converters", desc: "Extract MP3 audio from MP4 and other video files." },
    { slug: "pdf-to-word",      name: "PDF to Word Converter", cat: "pdf", desc: "Turn a text-based PDF into an editable Word document." },
    { slug: "random-number-generator", name: "Random Number Generator", cat: "generators", desc: "Generate secure random numbers in any range, in bulk." },
    { slug: "timestamp-converter", name: "Unix Timestamp Converter", cat: "developer", desc: "Convert Unix timestamps to dates and back, with a live clock." },
    { slug: "diff-checker",      name: "Diff Checker",      cat: "developer", desc: "Compare two texts line by line and highlight the changes." },
    { slug: "hash-generator",    name: "Hash Generator",    cat: "developer", desc: "Calculate MD5, SHA-1, SHA-256 and SHA-512 hashes." },
    { slug: "youtube-thumbnail-downloader", name: "YouTube Thumbnail Downloader", cat: "generators", desc: "Download any YouTube video's thumbnail in HD and more sizes." },
    { slug: "voice-recorder",    name: "Voice Recorder",    cat: "generators", desc: "Record your voice in the browser and download the audio." },
    { slug: "meme-generator",    name: "Meme Generator",    cat: "image",     desc: "Add top and bottom text to any image and download the meme." },
    { slug: "text-to-handwriting", name: "Text to Handwriting Converter", cat: "text", desc: "Turn typed text into handwritten notebook pages." },
    { slug: "date-calculator",   name: "Date Calculator",   cat: "calculators", desc: "Count days between dates, or add days to a date." },
    { slug: "compound-interest-calculator", name: "Compound Interest Calculator", cat: "calculators", desc: "See how savings grow with compound interest over time." },
    { slug: "gpa-calculator",    name: "GPA Calculator",    cat: "calculators", desc: "Work out your GPA from grades and credit hours." }
  ];
  var POPULAR = ["merge-pdf", "compress-image", "background-remover", "heic-to-jpg", "compress-pdf", "word-counter", "qr-code-generator", "image-to-text", "age-calculator", "password-generator", "json-formatter", "invoice-generator"];

  var bySlug = {}, catById = {};
  TOOLS.forEach(function (t) { bySlug[t.slug] = t; });
  CATEGORIES.forEach(function (c) { catById[c.id] = c; });

  /* ---------- Base path (root vs /tools/) ---------- */
  var scriptSrc = (document.currentScript && document.currentScript.getAttribute("src")) || "";
  var BASE = scriptSrc.indexOf("../") === 0 ? "../" : "";
  function toolUrl(slug) { return BASE + "tools/" + slug + ".html"; }

  /* ---------- localStorage helpers ---------- */
  function lsGet(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function getFavs() { return lsGet("t360:favs", []); }
  function getRecent() { return lsGet("t360:recent", []); }
  function recordRecent(slug) {
    if (!bySlug[slug] || bySlug[slug].soon) return;
    var r = getRecent().filter(function (s) { return s !== slug; });
    r.unshift(slug); lsSet("t360:recent", r.slice(0, 8));
  }
  function toggleFav(slug) {
    var f = getFavs(), i = f.indexOf(slug);
    if (i >= 0) f.splice(i, 1); else f.unshift(slug);
    lsSet("t360:favs", f);
    syncFavButtons(); renderHomeShelves();
    toast(i >= 0 ? "Removed from favourites" : "Saved to favourites");
  }
  function syncFavButtons() {
    var favs = getFavs();
    document.querySelectorAll(".fav-btn").forEach(function (b) {
      var on = favs.indexOf(b.getAttribute("data-slug")) >= 0;
      b.classList.toggle("active", on);
      b.textContent = on ? "★" : "☆";
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  /* ---------- Card rendering ---------- */
  function iconFor(t) { return ICONS[t.slug] || ICONS.soon; }
  function cardHTML(t) {
    if (t.soon) {
      return '<div class="tool-card soon" data-cat="' + t.cat + '" aria-disabled="true">' +
        '<span class="tool-icon">' + iconFor(t) + "</span>" +
        '<span class="tool-card-body"><span class="tool-name">' + t.name + '</span>' +
        '<span class="tool-desc">' + t.desc + "</span></span>" +
        '<span class="badge-soon">Soon</span></div>';
    }
    return '<a class="tool-card" href="' + toolUrl(t.slug) + '" data-cat="' + t.cat + '">' +
      '<span class="tool-icon">' + iconFor(t) + "</span>" +
      '<span class="tool-card-body"><span class="tool-name">' + t.name + '</span>' +
      '<span class="tool-desc">' + t.desc + "</span></span>" +
      '<span class="fav-btn" data-slug="' + t.slug + '" role="button" tabindex="0" aria-label="Save ' + t.name + ' to favourites" aria-pressed="false">☆</span></a>';
  }
  function renderHomeShelves() {
    var rg = document.getElementById("recent-grid"), fs = document.getElementById("fav-section"), fg = document.getElementById("fav-grid"), rs = document.getElementById("recent-section");
    if (rg && rs) {
      var rec = getRecent().map(function (s) { return bySlug[s]; }).filter(Boolean);
      if (rec.length) { rg.innerHTML = rec.map(cardHTML).join(""); rs.classList.remove("hidden"); }
      else rs.classList.add("hidden");
    }
    if (fg && fs) {
      var fav = getFavs().map(function (s) { return bySlug[s]; }).filter(Boolean);
      if (fav.length) { fg.innerHTML = fav.map(cardHTML).join(""); fs.classList.remove("hidden"); }
      else fs.classList.add("hidden");
    }
    syncFavButtons();
  }
  function renderRelated() {
    var mount = document.getElementById("related-tools");
    if (!mount) return;
    var cur = document.body.getAttribute("data-tool");
    var cat = document.body.getAttribute("data-category");
    var same = TOOLS.filter(function (t) { return !t.soon && t.cat === cat && t.slug !== cur; });
    var rest = POPULAR.map(function (s) { return bySlug[s]; }).filter(function (t) {
      return t && t.slug !== cur && same.indexOf(t) < 0;
    });
    mount.innerHTML = same.concat(rest).slice(0, 4).map(cardHTML).join("");
    syncFavButtons();
  }

  /* ---------- Logo (360 Orbit mark) ---------- */
  var LOGO_SVG = '<svg class="logo-svg" viewBox="0 0 2082 1187" fill="none" aria-hidden="true"><defs><linearGradient id="lg48-0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ccdf5"/><stop offset="0.5" stop-color="#2daff0"/><stop offset="1" stop-color="#2798d0"/></linearGradient><linearGradient id="lg48-1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbab7c"/><stop offset="0.5" stop-color="#fa782d"/><stop offset="1" stop-color="#d96827"/></linearGradient><linearGradient id="lg48-2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbd979"/><stop offset="0.5" stop-color="#fac328"/><stop offset="1" stop-color="#d9a922"/></linearGradient><linearGradient id="lg48-ring" gradientUnits="userSpaceOnUse" x1="-192" y1="-131" x2="1860" y2="939"><stop offset="0" stop-color="#e8eef7"/><stop offset="0.45" stop-color="#93a9c6"/><stop offset="0.72" stop-color="#c9d6e8"/><stop offset="1" stop-color="#7e97ba"/></linearGradient><linearGradient id="lg48-gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.50"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="0.07"/><stop offset="0.62" stop-color="#ffffff" stop-opacity="0"/></linearGradient><filter id="lg48-sh" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="15"/></filter></defs><g transform="translate(206.7 176.7)"><ellipse cx="834" cy="822" rx="601" ry="28" fill="#000000" opacity="0.28" filter="url(#lg48-sh)"/><path d="M-71.0 807.1 A1026.1 472.0 -16.0 1 1 1812.6 275.2" fill="none" stroke="#7e93b5" stroke-opacity="0.55" stroke-width="64" stroke-linecap="round" transform="translate(0 7)"/><path d="M-71.0 807.1 A1026.1 472.0 -16.0 1 1 1812.6 275.2" fill="none" stroke="url(#lg48-ring)" stroke-width="64" stroke-linecap="round"/><path d="M318.0 816.0Q245.0 816.0 172.5 798.0Q100.0 780.0 46.0 747.0L118.0 598.0Q160.0 626.0 211.0 641.0Q262.0 656.0 312.0 656.0Q362.0 656.0 392.5 637.0Q423.0 618.0 423.0 583.0Q423.0 552.0 398.0 533.5Q373.0 515.0 316.0 515.0H233.0V390.0L357.0 255.0H82.0V102.0H588.0V226.0L443.0 382.0Q532.0 401.0 577.5 454.5Q623.0 508.0 623.0 583.0Q623.0 643.0 590.5 696.0Q558.0 749.0 490.5 782.5Q423.0 816.0 318.0 816.0Z" fill="#124660"/><path d="M314.25 811.5Q241.25 811.5 168.75 793.5Q96.25 775.5 42.25 742.5L114.25 593.5Q156.25 621.5 207.25 636.5Q258.25 651.5 308.25 651.5Q358.25 651.5 388.75 632.5Q419.25 613.5 419.25 578.5Q419.25 547.5 394.25 529.0Q369.25 510.5 312.25 510.5H229.25V385.5L353.25 250.5H78.25V97.5H584.25V221.5L439.25 377.5Q528.25 396.5 573.75 450.0Q619.25 503.5 619.25 578.5Q619.25 638.5 586.75 691.5Q554.25 744.5 486.75 778.0Q419.25 811.5 314.25 811.5Z" fill="#134b67"/><path d="M310.5 807.0Q237.5 807.0 165.0 789.0Q92.5 771.0 38.5 738.0L110.5 589.0Q152.5 617.0 203.5 632.0Q254.5 647.0 304.5 647.0Q354.5 647.0 385.0 628.0Q415.5 609.0 415.5 574.0Q415.5 543.0 390.5 524.5Q365.5 506.0 308.5 506.0H225.5V381.0L349.5 246.0H74.5V93.0H580.5V217.0L435.5 373.0Q524.5 392.0 570.0 445.5Q615.5 499.0 615.5 574.0Q615.5 634.0 583.0 687.0Q550.5 740.0 483.0 773.5Q415.5 807.0 310.5 807.0Z" fill="#14506e"/><path d="M306.75 802.5Q233.75 802.5 161.25 784.5Q88.75 766.5 34.75 733.5L106.75 584.5Q148.75 612.5 199.75 627.5Q250.75 642.5 300.75 642.5Q350.75 642.5 381.25 623.5Q411.75 604.5 411.75 569.5Q411.75 538.5 386.75 520.0Q361.75 501.5 304.75 501.5H221.75V376.5L345.75 241.5H70.75V88.5H576.75V212.5L431.75 368.5Q520.75 387.5 566.25 441.0Q611.75 494.5 611.75 569.5Q611.75 629.5 579.25 682.5Q546.75 735.5 479.25 769.0Q411.75 802.5 306.75 802.5Z" fill="#155575"/><path d="M303.0 798.0Q230.0 798.0 157.5 780.0Q85.0 762.0 31.0 729.0L103.0 580.0Q145.0 608.0 196.0 623.0Q247.0 638.0 297.0 638.0Q347.0 638.0 377.5 619.0Q408.0 600.0 408.0 565.0Q408.0 534.0 383.0 515.5Q358.0 497.0 301.0 497.0H218.0V372.0L342.0 237.0H67.0V84.0H573.0V208.0L428.0 364.0Q517.0 383.0 562.5 436.5Q608.0 490.0 608.0 565.0Q608.0 625.0 575.5 678.0Q543.0 731.0 475.5 764.5Q408.0 798.0 303.0 798.0Z" fill="#175b7c"/><path d="M299.25 793.5Q226.25 793.5 153.75 775.5Q81.25 757.5 27.25 724.5L99.25 575.5Q141.25 603.5 192.25 618.5Q243.25 633.5 293.25 633.5Q343.25 633.5 373.75 614.5Q404.25 595.5 404.25 560.5Q404.25 529.5 379.25 511.0Q354.25 492.5 297.25 492.5H214.25V367.5L338.25 232.5H63.25V79.5H569.25V203.5L424.25 359.5Q513.25 378.5 558.75 432.0Q604.25 485.5 604.25 560.5Q604.25 620.5 571.75 673.5Q539.25 726.5 471.75 760.0Q404.25 793.5 299.25 793.5Z" fill="#186083"/><path d="M295.5 789.0Q222.5 789.0 150.0 771.0Q77.5 753.0 23.5 720.0L95.5 571.0Q137.5 599.0 188.5 614.0Q239.5 629.0 289.5 629.0Q339.5 629.0 370.0 610.0Q400.5 591.0 400.5 556.0Q400.5 525.0 375.5 506.5Q350.5 488.0 293.5 488.0H210.5V363.0L334.5 228.0H59.5V75.0H565.5V199.0L420.5 355.0Q509.5 374.0 555.0 427.5Q600.5 481.0 600.5 556.0Q600.5 616.0 568.0 669.0Q535.5 722.0 468.0 755.5Q400.5 789.0 295.5 789.0Z" fill="#19658a"/><path d="M291.75 784.5Q218.75 784.5 146.25 766.5Q73.75 748.5 19.75 715.5L91.75 566.5Q133.75 594.5 184.75 609.5Q235.75 624.5 285.75 624.5Q335.75 624.5 366.25 605.5Q396.75 586.5 396.75 551.5Q396.75 520.5 371.75 502.0Q346.75 483.5 289.75 483.5H206.75V358.5L330.75 223.5H55.75V70.5H561.75V194.5L416.75 350.5Q505.75 369.5 551.25 423.0Q596.75 476.5 596.75 551.5Q596.75 611.5 564.25 664.5Q531.75 717.5 464.25 751.0Q396.75 784.5 291.75 784.5Z" fill="#1a6a91"/><path d="M288 780Q215 780 142.5 762.0Q70 744 16 711L88 562Q130 590 181.0 605.0Q232 620 282 620Q332 620 362.5 601.0Q393 582 393 547Q393 516 368.0 497.5Q343 479 286 479H203V354L327 219H52V66H558V190L413 346Q502 365 547.5 418.5Q593 472 593 547Q593 607 560.5 660.0Q528 713 460.5 746.5Q393 780 288 780Z" fill="url(#lg48-0)"/><path d="M288 780Q215 780 142.5 762.0Q70 744 16 711L88 562Q130 590 181.0 605.0Q232 620 282 620Q332 620 362.5 601.0Q393 582 393 547Q393 516 368.0 497.5Q343 479 286 479H203V354L327 219H52V66H558V190L413 346Q502 365 547.5 418.5Q593 472 593 547Q593 607 560.5 660.0Q528 713 460.5 746.5Q393 780 288 780Z" fill="url(#lg48-gloss)"/><path d="M1344.52 816.0Q1254.52 816.0 1185.02 773.0Q1115.52 730.0 1075.52 649.0Q1035.52 568.0 1035.52 452.0Q1035.52 336.0 1075.52 255.0Q1115.52 174.0 1185.02 131.0Q1254.52 88.0 1344.52 88.0Q1433.52 88.0 1503.02 131.0Q1572.52 174.0 1612.52 255.0Q1652.52 336.0 1652.52 452.0Q1652.52 568.0 1612.52 649.0Q1572.52 730.0 1503.02 773.0Q1433.52 816.0 1344.52 816.0ZM1344.52 654.0Q1391.52 654.0 1422.52 608.0Q1453.52 562.0 1453.52 452.0Q1453.52 342.0 1422.52 296.0Q1391.52 250.0 1344.52 250.0Q1296.52 250.0 1265.52 296.0Q1234.52 342.0 1234.52 452.0Q1234.52 562.0 1265.52 608.0Q1296.52 654.0 1344.52 654.0Z" fill="#644e10"/><path d="M1340.77 811.5Q1250.77 811.5 1181.27 768.5Q1111.77 725.5 1071.77 644.5Q1031.77 563.5 1031.77 447.5Q1031.77 331.5 1071.77 250.5Q1111.77 169.5 1181.27 126.5Q1250.77 83.5 1340.77 83.5Q1429.77 83.5 1499.27 126.5Q1568.77 169.5 1608.77 250.5Q1648.77 331.5 1648.77 447.5Q1648.77 563.5 1608.77 644.5Q1568.77 725.5 1499.27 768.5Q1429.77 811.5 1340.77 811.5ZM1340.77 649.5Q1387.77 649.5 1418.77 603.5Q1449.77 557.5 1449.77 447.5Q1449.77 337.5 1418.77 291.5Q1387.77 245.5 1340.77 245.5Q1292.77 245.5 1261.77 291.5Q1230.77 337.5 1230.77 447.5Q1230.77 557.5 1261.77 603.5Q1292.77 649.5 1340.77 649.5Z" fill="#6b5311"/><path d="M1337.02 807.0Q1247.02 807.0 1177.52 764.0Q1108.02 721.0 1068.02 640.0Q1028.02 559.0 1028.02 443.0Q1028.02 327.0 1068.02 246.0Q1108.02 165.0 1177.52 122.0Q1247.02 79.0 1337.02 79.0Q1426.02 79.0 1495.52 122.0Q1565.02 165.0 1605.02 246.0Q1645.02 327.0 1645.02 443.0Q1645.02 559.0 1605.02 640.0Q1565.02 721.0 1495.52 764.0Q1426.02 807.0 1337.02 807.0ZM1337.02 645.0Q1384.02 645.0 1415.02 599.0Q1446.02 553.0 1446.02 443.0Q1446.02 333.0 1415.02 287.0Q1384.02 241.0 1337.02 241.0Q1289.02 241.0 1258.02 287.0Q1227.02 333.0 1227.02 443.0Q1227.02 553.0 1258.02 599.0Q1289.02 645.0 1337.02 645.0Z" fill="#735912"/><path d="M1333.27 802.5Q1243.27 802.5 1173.77 759.5Q1104.27 716.5 1064.27 635.5Q1024.27 554.5 1024.27 438.5Q1024.27 322.5 1064.27 241.5Q1104.27 160.5 1173.77 117.5Q1243.27 74.5 1333.27 74.5Q1422.27 74.5 1491.77 117.5Q1561.27 160.5 1601.27 241.5Q1641.27 322.5 1641.27 438.5Q1641.27 554.5 1601.27 635.5Q1561.27 716.5 1491.77 759.5Q1422.27 802.5 1333.27 802.5ZM1333.27 640.5Q1380.27 640.5 1411.27 594.5Q1442.27 548.5 1442.27 438.5Q1442.27 328.5 1411.27 282.5Q1380.27 236.5 1333.27 236.5Q1285.27 236.5 1254.27 282.5Q1223.27 328.5 1223.27 438.5Q1223.27 548.5 1254.27 594.5Q1285.27 640.5 1333.27 640.5Z" fill="#7a5f13"/><path d="M1329.52 798.0Q1239.52 798.0 1170.02 755.0Q1100.52 712.0 1060.52 631.0Q1020.52 550.0 1020.52 434.0Q1020.52 318.0 1060.52 237.0Q1100.52 156.0 1170.02 113.0Q1239.52 70.0 1329.52 70.0Q1418.52 70.0 1488.02 113.0Q1557.52 156.0 1597.52 237.0Q1637.52 318.0 1637.52 434.0Q1637.52 550.0 1597.52 631.0Q1557.52 712.0 1488.02 755.0Q1418.52 798.0 1329.52 798.0ZM1329.52 636.0Q1376.52 636.0 1407.52 590.0Q1438.52 544.0 1438.52 434.0Q1438.52 324.0 1407.52 278.0Q1376.52 232.0 1329.52 232.0Q1281.52 232.0 1250.52 278.0Q1219.52 324.0 1219.52 434.0Q1219.52 544.0 1250.52 590.0Q1281.52 636.0 1329.52 636.0Z" fill="#826514"/><path d="M1325.77 793.5Q1235.77 793.5 1166.27 750.5Q1096.77 707.5 1056.77 626.5Q1016.77 545.5 1016.77 429.5Q1016.77 313.5 1056.77 232.5Q1096.77 151.5 1166.27 108.5Q1235.77 65.5 1325.77 65.5Q1414.77 65.5 1484.27 108.5Q1553.77 151.5 1593.77 232.5Q1633.77 313.5 1633.77 429.5Q1633.77 545.5 1593.77 626.5Q1553.77 707.5 1484.27 750.5Q1414.77 793.5 1325.77 793.5ZM1325.77 631.5Q1372.77 631.5 1403.77 585.5Q1434.77 539.5 1434.77 429.5Q1434.77 319.5 1403.77 273.5Q1372.77 227.5 1325.77 227.5Q1277.77 227.5 1246.77 273.5Q1215.77 319.5 1215.77 429.5Q1215.77 539.5 1246.77 585.5Q1277.77 631.5 1325.77 631.5Z" fill="#896a15"/><path d="M1322.02 789.0Q1232.02 789.0 1162.52 746.0Q1093.02 703.0 1053.02 622.0Q1013.02 541.0 1013.02 425.0Q1013.02 309.0 1053.02 228.0Q1093.02 147.0 1162.52 104.0Q1232.02 61.0 1322.02 61.0Q1411.02 61.0 1480.52 104.0Q1550.02 147.0 1590.02 228.0Q1630.02 309.0 1630.02 425.0Q1630.02 541.0 1590.02 622.0Q1550.02 703.0 1480.52 746.0Q1411.02 789.0 1322.02 789.0ZM1322.02 627.0Q1369.02 627.0 1400.02 581.0Q1431.02 535.0 1431.02 425.0Q1431.02 315.0 1400.02 269.0Q1369.02 223.0 1322.02 223.0Q1274.02 223.0 1243.02 269.0Q1212.02 315.0 1212.02 425.0Q1212.02 535.0 1243.02 581.0Q1274.02 627.0 1322.02 627.0Z" fill="#917016"/><path d="M1318.27 784.5Q1228.27 784.5 1158.77 741.5Q1089.27 698.5 1049.27 617.5Q1009.27 536.5 1009.27 420.5Q1009.27 304.5 1049.27 223.5Q1089.27 142.5 1158.77 99.5Q1228.27 56.5 1318.27 56.5Q1407.27 56.5 1476.77 99.5Q1546.27 142.5 1586.27 223.5Q1626.27 304.5 1626.27 420.5Q1626.27 536.5 1586.27 617.5Q1546.27 698.5 1476.77 741.5Q1407.27 784.5 1318.27 784.5ZM1318.27 622.5Q1365.27 622.5 1396.27 576.5Q1427.27 530.5 1427.27 420.5Q1427.27 310.5 1396.27 264.5Q1365.27 218.5 1318.27 218.5Q1270.27 218.5 1239.27 264.5Q1208.27 310.5 1208.27 420.5Q1208.27 530.5 1239.27 576.5Q1270.27 622.5 1318.27 622.5Z" fill="#987617"/><path d="M1314.52 780Q1224.52 780 1155.02 737.0Q1085.52 694 1045.52 613.0Q1005.52 532 1005.52 416Q1005.52 300 1045.52 219.0Q1085.52 138 1155.02 95.0Q1224.52 52 1314.52 52Q1403.52 52 1473.02 95.0Q1542.52 138 1582.52 219.0Q1622.52 300 1622.52 416Q1622.52 532 1582.52 613.0Q1542.52 694 1473.02 737.0Q1403.52 780 1314.52 780ZM1314.52 618Q1361.52 618 1392.52 572.0Q1423.52 526 1423.52 416Q1423.52 306 1392.52 260.0Q1361.52 214 1314.52 214Q1266.52 214 1235.52 260.0Q1204.52 306 1204.52 416Q1204.52 526 1235.52 572.0Q1266.52 618 1314.52 618Z" fill="url(#lg48-2)"/><path d="M1314.52 780Q1224.52 780 1155.02 737.0Q1085.52 694 1045.52 613.0Q1005.52 532 1005.52 416Q1005.52 300 1045.52 219.0Q1085.52 138 1155.02 95.0Q1224.52 52 1314.52 52Q1403.52 52 1473.02 95.0Q1542.52 138 1582.52 219.0Q1622.52 300 1622.52 416Q1622.52 532 1582.52 613.0Q1542.52 694 1473.02 737.0Q1403.52 780 1314.52 780ZM1314.52 618Q1361.52 618 1392.52 572.0Q1423.52 526 1423.52 416Q1423.52 306 1392.52 260.0Q1361.52 214 1314.52 214Q1266.52 214 1235.52 260.0Q1204.52 306 1204.52 416Q1204.52 526 1235.52 572.0Q1266.52 618 1314.52 618Z" fill="url(#lg48-gloss)"/><path d="M866.28 816.0Q768.28 816.0 695.28 777.0Q622.28 738.0 582.28 661.0Q542.28 584.0 542.28 471.0Q542.28 349.0 589.28 263.5Q636.28 178.0 720.28 133.0Q804.28 88.0 914.28 88.0Q973.28 88.0 1027.78 101.5Q1082.28 115.0 1120.28 139.0L1048.28 281.0Q1018.28 260.0 985.78 252.5Q953.28 245.0 919.28 245.0Q844.28 245.0 797.28 286.0Q750.28 327.0 743.28 407.0Q802.28 356.0 900.28 356.0Q966.28 356.0 1020.78 383.5Q1075.28 411.0 1108.28 460.5Q1141.28 510.0 1141.28 577.0Q1141.28 650.0 1104.28 703.5Q1067.28 757.0 1005.28 786.5Q943.28 816.0 866.28 816.0ZM854.28 675.0Q896.28 675.0 922.78 651.0Q949.28 627.0 949.28 586.0Q949.28 546.0 922.78 522.0Q896.28 498.0 853.28 498.0Q810.28 498.0 783.28 522.5Q756.28 547.0 756.28 587.0Q756.28 626.0 782.78 650.5Q809.28 675.0 854.28 675.0Z" fill="#643012"/><path d="M862.53 811.5Q764.53 811.5 691.53 772.5Q618.53 733.5 578.53 656.5Q538.53 579.5 538.53 466.5Q538.53 344.5 585.53 259.0Q632.53 173.5 716.53 128.5Q800.53 83.5 910.53 83.5Q969.53 83.5 1024.03 97.0Q1078.53 110.5 1116.53 134.5L1044.53 276.5Q1014.53 255.5 982.03 248.0Q949.53 240.5 915.53 240.5Q840.53 240.5 793.53 281.5Q746.53 322.5 739.53 402.5Q798.53 351.5 896.53 351.5Q962.53 351.5 1017.03 379.0Q1071.53 406.5 1104.53 456.0Q1137.53 505.5 1137.53 572.5Q1137.53 645.5 1100.53 699.0Q1063.53 752.5 1001.53 782.0Q939.53 811.5 862.53 811.5ZM850.53 670.5Q892.53 670.5 919.03 646.5Q945.53 622.5 945.53 581.5Q945.53 541.5 919.03 517.5Q892.53 493.5 849.53 493.5Q806.53 493.5 779.53 518.0Q752.53 542.5 752.53 582.5Q752.53 621.5 779.03 646.0Q805.53 670.5 850.53 670.5Z" fill="#6b3313"/><path d="M858.78 807.0Q760.78 807.0 687.78 768.0Q614.78 729.0 574.78 652.0Q534.78 575.0 534.78 462.0Q534.78 340.0 581.78 254.5Q628.78 169.0 712.78 124.0Q796.78 79.0 906.78 79.0Q965.78 79.0 1020.28 92.5Q1074.78 106.0 1112.78 130.0L1040.78 272.0Q1010.78 251.0 978.28 243.5Q945.78 236.0 911.78 236.0Q836.78 236.0 789.78 277.0Q742.78 318.0 735.78 398.0Q794.78 347.0 892.78 347.0Q958.78 347.0 1013.28 374.5Q1067.78 402.0 1100.78 451.5Q1133.78 501.0 1133.78 568.0Q1133.78 641.0 1096.78 694.5Q1059.78 748.0 997.78 777.5Q935.78 807.0 858.78 807.0ZM846.78 666.0Q888.78 666.0 915.28 642.0Q941.78 618.0 941.78 577.0Q941.78 537.0 915.28 513.0Q888.78 489.0 845.78 489.0Q802.78 489.0 775.78 513.5Q748.78 538.0 748.78 578.0Q748.78 617.0 775.28 641.5Q801.78 666.0 846.78 666.0Z" fill="#733714"/><path d="M855.03 802.5Q757.03 802.5 684.03 763.5Q611.03 724.5 571.03 647.5Q531.03 570.5 531.03 457.5Q531.03 335.5 578.03 250.0Q625.03 164.5 709.03 119.5Q793.03 74.5 903.03 74.5Q962.03 74.5 1016.53 88.0Q1071.03 101.5 1109.03 125.5L1037.03 267.5Q1007.03 246.5 974.53 239.0Q942.03 231.5 908.03 231.5Q833.03 231.5 786.03 272.5Q739.03 313.5 732.03 393.5Q791.03 342.5 889.03 342.5Q955.03 342.5 1009.53 370.0Q1064.03 397.5 1097.03 447.0Q1130.03 496.5 1130.03 563.5Q1130.03 636.5 1093.03 690.0Q1056.03 743.5 994.03 773.0Q932.03 802.5 855.03 802.5ZM843.03 661.5Q885.03 661.5 911.53 637.5Q938.03 613.5 938.03 572.5Q938.03 532.5 911.53 508.5Q885.03 484.5 842.03 484.5Q799.03 484.5 772.03 509.0Q745.03 533.5 745.03 573.5Q745.03 612.5 771.53 637.0Q798.03 661.5 843.03 661.5Z" fill="#7a3a15"/><path d="M851.28 798.0Q753.28 798.0 680.28 759.0Q607.28 720.0 567.28 643.0Q527.28 566.0 527.28 453.0Q527.28 331.0 574.28 245.5Q621.28 160.0 705.28 115.0Q789.28 70.0 899.28 70.0Q958.28 70.0 1012.78 83.5Q1067.28 97.0 1105.28 121.0L1033.28 263.0Q1003.28 242.0 970.78 234.5Q938.28 227.0 904.28 227.0Q829.28 227.0 782.28 268.0Q735.28 309.0 728.28 389.0Q787.28 338.0 885.28 338.0Q951.28 338.0 1005.78 365.5Q1060.28 393.0 1093.28 442.5Q1126.28 492.0 1126.28 559.0Q1126.28 632.0 1089.28 685.5Q1052.28 739.0 990.28 768.5Q928.28 798.0 851.28 798.0ZM839.28 657.0Q881.28 657.0 907.78 633.0Q934.28 609.0 934.28 568.0Q934.28 528.0 907.78 504.0Q881.28 480.0 838.28 480.0Q795.28 480.0 768.28 504.5Q741.28 529.0 741.28 569.0Q741.28 608.0 767.78 632.5Q794.28 657.0 839.28 657.0Z" fill="#823e17"/><path d="M847.53 793.5Q749.53 793.5 676.53 754.5Q603.53 715.5 563.53 638.5Q523.53 561.5 523.53 448.5Q523.53 326.5 570.53 241.0Q617.53 155.5 701.53 110.5Q785.53 65.5 895.53 65.5Q954.53 65.5 1009.03 79.0Q1063.53 92.5 1101.53 116.5L1029.53 258.5Q999.53 237.5 967.03 230.0Q934.53 222.5 900.53 222.5Q825.53 222.5 778.53 263.5Q731.53 304.5 724.53 384.5Q783.53 333.5 881.53 333.5Q947.53 333.5 1002.03 361.0Q1056.53 388.5 1089.53 438.0Q1122.53 487.5 1122.53 554.5Q1122.53 627.5 1085.53 681.0Q1048.53 734.5 986.53 764.0Q924.53 793.5 847.53 793.5ZM835.53 652.5Q877.53 652.5 904.03 628.5Q930.53 604.5 930.53 563.5Q930.53 523.5 904.03 499.5Q877.53 475.5 834.53 475.5Q791.53 475.5 764.53 500.0Q737.53 524.5 737.53 564.5Q737.53 603.5 764.03 628.0Q790.53 652.5 835.53 652.5Z" fill="#894118"/><path d="M843.78 789.0Q745.78 789.0 672.78 750.0Q599.78 711.0 559.78 634.0Q519.78 557.0 519.78 444.0Q519.78 322.0 566.78 236.5Q613.78 151.0 697.78 106.0Q781.78 61.0 891.78 61.0Q950.78 61.0 1005.28 74.5Q1059.78 88.0 1097.78 112.0L1025.78 254.0Q995.78 233.0 963.28 225.5Q930.78 218.0 896.78 218.0Q821.78 218.0 774.78 259.0Q727.78 300.0 720.78 380.0Q779.78 329.0 877.78 329.0Q943.78 329.0 998.28 356.5Q1052.78 384.0 1085.78 433.5Q1118.78 483.0 1118.78 550.0Q1118.78 623.0 1081.78 676.5Q1044.78 730.0 982.78 759.5Q920.78 789.0 843.78 789.0ZM831.78 648.0Q873.78 648.0 900.28 624.0Q926.78 600.0 926.78 559.0Q926.78 519.0 900.28 495.0Q873.78 471.0 830.78 471.0Q787.78 471.0 760.78 495.5Q733.78 520.0 733.78 560.0Q733.78 599.0 760.28 623.5Q786.78 648.0 831.78 648.0Z" fill="#914519"/><path d="M840.03 784.5Q742.03 784.5 669.03 745.5Q596.03 706.5 556.03 629.5Q516.03 552.5 516.03 439.5Q516.03 317.5 563.03 232.0Q610.03 146.5 694.03 101.5Q778.03 56.5 888.03 56.5Q947.03 56.5 1001.53 70.0Q1056.03 83.5 1094.03 107.5L1022.03 249.5Q992.03 228.5 959.53 221.0Q927.03 213.5 893.03 213.5Q818.03 213.5 771.03 254.5Q724.03 295.5 717.03 375.5Q776.03 324.5 874.03 324.5Q940.03 324.5 994.53 352.0Q1049.03 379.5 1082.03 429.0Q1115.03 478.5 1115.03 545.5Q1115.03 618.5 1078.03 672.0Q1041.03 725.5 979.03 755.0Q917.03 784.5 840.03 784.5ZM828.03 643.5Q870.03 643.5 896.53 619.5Q923.03 595.5 923.03 554.5Q923.03 514.5 896.53 490.5Q870.03 466.5 827.03 466.5Q784.03 466.5 757.03 491.0Q730.03 515.5 730.03 555.5Q730.03 594.5 756.53 619.0Q783.03 643.5 828.03 643.5Z" fill="#98481a"/><path d="M836.28 780Q738.28 780 665.28 741.0Q592.28 702 552.28 625.0Q512.28 548 512.28 435Q512.28 313 559.28 227.5Q606.28 142 690.28 97.0Q774.28 52 884.28 52Q943.28 52 997.78 65.5Q1052.28 79 1090.28 103L1018.28 245Q988.28 224 955.78 216.5Q923.28 209 889.28 209Q814.28 209 767.28 250.0Q720.28 291 713.28 371Q772.28 320 870.28 320Q936.28 320 990.78 347.5Q1045.28 375 1078.28 424.5Q1111.28 474 1111.28 541Q1111.28 614 1074.28 667.5Q1037.28 721 975.28 750.5Q913.28 780 836.28 780ZM824.28 639Q866.28 639 892.78 615.0Q919.28 591 919.28 550Q919.28 510 892.78 486.0Q866.28 462 823.28 462Q780.28 462 753.28 486.5Q726.28 511 726.28 551Q726.28 590 752.78 614.5Q779.28 639 824.28 639Z" fill="url(#lg48-1)"/><path d="M836.28 780Q738.28 780 665.28 741.0Q592.28 702 552.28 625.0Q512.28 548 512.28 435Q512.28 313 559.28 227.5Q606.28 142 690.28 97.0Q774.28 52 884.28 52Q943.28 52 997.78 65.5Q1052.28 79 1090.28 103L1018.28 245Q988.28 224 955.78 216.5Q923.28 209 889.28 209Q814.28 209 767.28 250.0Q720.28 291 713.28 371Q772.28 320 870.28 320Q936.28 320 990.78 347.5Q1045.28 375 1078.28 424.5Q1111.28 474 1111.28 541Q1111.28 614 1074.28 667.5Q1037.28 721 975.28 750.5Q913.28 780 836.28 780ZM824.28 639Q866.28 639 892.78 615.0Q919.28 591 919.28 550Q919.28 510 892.78 486.0Q866.28 462 823.28 462Q780.28 462 753.28 486.5Q726.28 511 726.28 551Q726.28 590 752.78 614.5Q779.28 639 824.28 639Z" fill="url(#lg48-gloss)"/><path d="M1812.6 275.2 A1026.1 472.0 -16.0 0 1 -71.0 807.1" fill="none" stroke="#7e93b5" stroke-opacity="0.55" stroke-width="64" stroke-linecap="round" transform="translate(0 7)"/><path d="M1812.6 275.2 A1026.1 472.0 -16.0 0 1 -71.0 807.1" fill="none" stroke="url(#lg48-ring)" stroke-width="64" stroke-linecap="round"/></g></svg>';

  /* ---------- Header / footer injection ---------- */
  var sunSVG = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var moonSVG = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var searchSVG = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20.5 20.5 16.7 16.7"/></svg>';

  function currentTheme() { return document.documentElement.getAttribute("data-theme") || "light"; }
  function injectChrome() {
    var header = document.getElementById("site-header");
    if (header) {
      var nav = '<a href="' + BASE + 'index.html#popular">Popular</a>' + CATEGORIES.map(function (c) {
        return '<a href="' + BASE + "index.html#" + c.id + '">' + c.name.replace(" Tools", "") + "</a>";
      }).join("");
      header.className = "site-header";
      header.innerHTML =
        '<div class="container header-inner">' +
          '<a class="logo" href="' + BASE + 'index.html" aria-label="Tools360Pro home">' + LOGO_SVG + '<span>Tools<span class="logo-num">360</span>Pro</span></a>' +
          '<nav class="main-nav" aria-label="Tool categories">' + nav + "</nav>" +
          '<div class="header-actions">' +
            '<button class="search-btn" id="hdr-search" type="button" aria-label="Search tools">' + searchSVG + '<span class="sb-label">Search tools…</span><span class="spacer"></span><span class="kbd">Ctrl K</span></button>' +
            '<button class="icon-btn" id="theme-toggle" type="button" aria-label="Toggle dark mode">' + (currentTheme() === "dark" ? sunSVG : moonSVG) + "</button>" +
          "</div>" +
        "</div>";
      document.getElementById("hdr-search").addEventListener("click", function () { openPalette(""); });
      document.getElementById("theme-toggle").addEventListener("click", function () {
        var next = currentTheme() === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        lsSet("t360:theme", next);
        this.innerHTML = next === "dark" ? sunSVG : moonSVG;
      });
    }
    var footer = document.getElementById("site-footer");
    if (footer) {
      var catLinks = CATEGORIES.map(function (c) {
        return '<li><a href="' + BASE + "index.html#" + c.id + '">' + c.name + "</a></li>";
      }).join("");
      function toolLinks(catIds) {
        return TOOLS.filter(function (t) { return !t.soon && catIds.indexOf(t.cat) >= 0; })
          .map(function (t) { return '<li><a href="' + toolUrl(t.slug) + '">' + t.name + "</a></li>"; }).join("");
      }
      footer.className = "site-footer";
      footer.innerHTML =
        '<div class="container">' +
          '<div class="footer-grid">' +
            '<div class="footer-brand">' +
              '<a class="logo" href="' + BASE + 'index.html">' + LOGO_SVG + '<span>Tools<span class="logo-num">360</span>Pro</span></a>' +
              "<p>Free online tools for PDFs, images, text, conversions and code. Everything runs locally in your browser — your files are never uploaded to a server.</p>" +
            "</div>" +
            "<div><h4>Categories</h4><ul>" + catLinks + "</ul></div>" +
            "<div><h4>Popular tools</h4><ul>" + POPULAR.slice(0, 7).map(function (s) {
                var t = bySlug[s]; return '<li><a href="' + toolUrl(s) + '">' + t.name + "</a></li>";
              }).join("") + "</ul></div>" +
            "<div><h4>More tools</h4><ul>" + toolLinks(["text", "calculators", "developer", "generators"]) + "</ul></div>" +
          "</div>" +
          '<nav class="footer-links" aria-label="About Tools360Pro">' +
            '<a href="' + BASE + 'about.html">About Us</a>' +
            '<a href="' + BASE + 'contact.html">Contact Us</a>' +
            '<a href="' + BASE + 'privacy-policy.html">Privacy Policy</a>' +
            '<a href="' + BASE + 'terms.html">Terms of Use</a>' +
            '<a href="' + BASE + 'disclaimer.html">Disclaimer</a>' +
          '</nav>' +
          '<div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' Tools360Pro. Free tools that respect your privacy.</span><span>Runs 100% in your browser · No sign-up · No uploads</span></div>' +
        "</div>";
    }
  }

  /* ---------- Command palette ---------- */
  var overlay, palInput, palList, palItems = [], palSel = 0;
  function fuzzyScore(q, name) {
    q = q.toLowerCase(); name = name.toLowerCase();
    if (!q) return 1;
    var idx = name.indexOf(q);
    if (idx >= 0) return 1000 - idx;
    var qi = 0, score = 0, last = -1;
    for (var i = 0; i < name.length && qi < q.length; i++) {
      if (name[i] === q[qi]) { score += last === i - 1 ? 3 : 1; last = i; qi++; }
    }
    return qi === q.length ? score : -1;
  }
  function paletteResults(q) {
    q = (q || "").trim();
    if (!q) {
      var out = [];
      var rec = getRecent().map(function (s) { return bySlug[s]; }).filter(Boolean);
      if (rec.length) out.push({ group: "Recent", tools: rec });
      var fav = getFavs().map(function (s) { return bySlug[s]; }).filter(Boolean);
      if (fav.length) out.push({ group: "Favourites", tools: fav });
      out.push({ group: "Popular", tools: POPULAR.map(function (s) { return bySlug[s]; }) });
      return out;
    }
    var scored = TOOLS.filter(function (t) { return !t.soon; })
      .map(function (t) { return { t: t, s: Math.max(fuzzyScore(q, t.name), fuzzyScore(q, t.slug.replace(/-/g, " ")) * 0.9) }; })
      .filter(function (x) { return x.s >= 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 10).map(function (x) { return x.t; });
    return scored.length ? [{ group: "Tools", tools: scored }] : [];
  }
  function renderPalette(q) {
    var groups = paletteResults(q);
    palItems = [];
    if (!groups.length) {
      palList.innerHTML = '<div class="palette-empty">No tools match “' + q.replace(/</g, "&lt;") + '”. Try “merge”, “image” or “json”.</div>';
      return;
    }
    palList.innerHTML = groups.map(function (g) {
      return '<div class="palette-group">' + g.group + "</div>" + g.tools.map(function (t) {
        palItems.push(t);
        return '<div class="palette-item" data-slug="' + t.slug + '" role="option">' +
          '<span class="tool-icon" data-cat="' + t.cat + '">' + iconFor(t) + "</span>" +
          '<span class="pi-name">' + t.name + '</span><span class="pi-cat">' + catById[t.cat].name + "</span></div>";
      }).join("");
    }).join("");
    palSel = 0; markPalSel();
    palList.querySelectorAll(".palette-item").forEach(function (el) {
      el.addEventListener("click", function () { goTool(el.getAttribute("data-slug")); });
      el.addEventListener("mousemove", function () {
        var i = Array.prototype.indexOf.call(palList.querySelectorAll(".palette-item"), el);
        if (i >= 0 && i !== palSel) { palSel = i; markPalSel(); }
      });
    });
  }
  function markPalSel() {
    palList.querySelectorAll(".palette-item").forEach(function (el, i) {
      el.classList.toggle("sel", i === palSel);
      if (i === palSel && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    });
  }
  function goTool(slug) {
    recordRecent(slug);
    window.location.href = toolUrl(slug);
  }
  function openPalette(q) {
    if (!overlay) buildPalette();
    overlay.classList.add("open");
    palInput.value = q || "";
    renderPalette(palInput.value);
    setTimeout(function () { palInput.focus(); palInput.select(); }, 10);
    document.body.style.overflow = "hidden";
  }
  function closePalette() {
    if (overlay) overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  function buildPalette() {
    overlay = document.createElement("div");
    overlay.className = "palette-overlay";
    overlay.innerHTML =
      '<div class="palette" role="dialog" aria-modal="true" aria-label="Search tools">' +
        '<div class="palette-brand">' + LOGO_SVG + '<span class="palette-brand-name">Tools<span class="logo-num">360</span>Pro</span></div>' +
        '<input type="text" placeholder="Search tools… (try “merge” or “json”)" aria-label="Search tools" autocomplete="off">' +
        '<div class="palette-list" role="listbox"></div>' +
        '<div class="palette-foot"><span><span class="kbd">↑</span> <span class="kbd">↓</span> navigate</span><span><span class="kbd">Enter</span> open</span><span><span class="kbd">Esc</span> close</span></div>' +
      "</div>";
    document.body.appendChild(overlay);
    palInput = overlay.querySelector("input");
    palList = overlay.querySelector(".palette-list");
    palInput.addEventListener("input", function () { renderPalette(palInput.value); });
    palInput.addEventListener("keydown", function (e) {
      var n = palList.querySelectorAll(".palette-item").length;
      if (e.key === "ArrowDown") { e.preventDefault(); palSel = Math.min(palSel + 1, n - 1); markPalSel(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); palSel = Math.max(palSel - 1, 0); markPalSel(); }
      else if (e.key === "Enter") { var el = palList.querySelectorAll(".palette-item")[palSel]; if (el) goTool(el.getAttribute("data-slug")); }
    });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closePalette(); });
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = document.querySelector(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  /* ---------- Public helpers ---------- */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function formatBytes(n) {
    if (n == null || isNaN(n)) return "—";
    if (n < 1024) return n + " B";
    var units = ["KB", "MB", "GB"], i = -1, v = n;
    do { v /= 1024; i++; } while (v >= 1024 && i < units.length - 1);
    return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + " " + units[i];
  }
  function trackEvent(name) {
    try {
      if (window.gtag) {
        var slug = (location.pathname.split("/").pop() || "").replace(/\.html$/, "") || "home";
        window.gtag("event", name, { tool: slug });
      }
    } catch (e) { /* analytics must never break a tool */ }
  }
  function download(blobOrUrl, filename) {
    trackEvent("tool_download");
    var url = typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    var a = document.createElement("a");
    a.href = url; a.download = filename || "download";
    document.body.appendChild(a); a.click(); a.remove();
    if (typeof blobOrUrl !== "string") setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function copyText(text, btn) {
    trackEvent("tool_copy");
    function done() {
      if (btn) {
        var old = btn.getAttribute("data-label") || btn.textContent;
        btn.setAttribute("data-label", old);
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = btn.getAttribute("data-label"); }, 1600);
      }
      toast("Copied to clipboard");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else fallback();
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed — select and copy manually"); }
      ta.remove();
    }
  }

  window.T360 = {
    qs: qs, qsa: qsa, toast: toast, download: download, copyText: copyText,
    formatBytes: formatBytes, tools: TOOLS, categories: CATEGORIES, openPalette: openPalette,
    iconFor: iconFor, bySlug: bySlug, catById: catById
  };

  /* ---------- Init ---------- */
  (function initTheme() {
    /* Dark is the default theme; a saved choice always wins. */
    var saved = lsGet("t360:theme", null);
    document.documentElement.setAttribute("data-theme", saved === "light" ? "light" : "dark");
  })();

  injectChrome();
  /* Hydrate static homepage card icons from the registry */
  document.querySelectorAll(".tool-icon[data-icon]").forEach(function (el) {
    var s = el.getAttribute("data-icon");
    if (ICONS[s]) el.innerHTML = ICONS[s];
  });
  renderRelated();
  renderHomeShelves();
  syncFavButtons();

  var curSlug = document.body.getAttribute("data-tool");
  if (curSlug) recordRecent(curSlug);

  document.addEventListener("click", function (e) {
    var fb = e.target.closest ? e.target.closest(".fav-btn") : null;
    if (fb) { e.preventDefault(); e.stopPropagation(); toggleFav(fb.getAttribute("data-slug")); }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (overlay && overlay.classList.contains("open")) closePalette(); else openPalette("");
    } else if (e.key === "Escape") closePalette();
    if (e.key === "Enter" && e.target && e.target.classList && e.target.classList.contains("fav-btn")) {
      e.preventDefault(); toggleFav(e.target.getAttribute("data-slug"));
    }
  });

  var heroSearch = document.getElementById("hero-search");
  if (heroSearch) {
    heroSearch.addEventListener("focus", function () { openPalette(heroSearch.value); });
    heroSearch.addEventListener("input", function () {
      if (overlay && overlay.classList.contains("open")) { palInput.value = heroSearch.value; renderPalette(palInput.value); }
    });
  }

  /* Scroll reveal for homepage cards */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.08 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("in"); });
    }
  }

  /* ---------- 3D tilt + glow on cards (fine pointers only) ---------- */
  if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".tool-card, .cat-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--ry", ((px - 0.5) * 7).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - py) * 7).toFixed(2) + "deg");
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        card.classList.add("tilting");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.classList.remove("tilting");
      });
    });
  }

  /* ---------- Marquee: clone the set once for a seamless loop ---------- */
  var mqTrack = document.getElementById("marquee-track");
  if (mqTrack && mqTrack.children.length === 1) {
    mqTrack.appendChild(mqTrack.children[0].cloneNode(true));
    mqTrack.classList.add("loop");
  }
})();
