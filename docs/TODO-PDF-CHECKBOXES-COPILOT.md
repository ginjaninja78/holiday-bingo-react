# TODO: PDF Interactive Checkboxes (GitHub Copilot Implementation Guide)

## 🎯 Objective
Add clickable checkboxes to PDF bingo cards so players can mark squares by clicking instead of using stamps.

---

## 📋 Requirements

- Use jsPDF with AcroForm plugin for form fields
- Add checkbox to each of the 24 image squares (not FREE space)
- Checkboxes should overlay the top-right corner of each square
- Clicking toggles checkbox on/off
- Works in Adobe Reader, Chrome, Edge PDF viewers
- Update player instructions to mention clicking checkboxes

---

## 📁 Files to Modify

### Primary File
- `server/pdfGenerator.ts` - Add checkbox form fields to PDF

### Supporting Files (if needed)
- `package.json` - Ensure jsPDF dependencies are installed

---

## 🔧 Implementation Steps

### Step 1: Install jsPDF AcroForm Plugin

**File:** `package.json`

Check if `jspdf` is already installed. If not, or if it doesn't include AcroForm:

```bash
pnpm add jspdf
```

The AcroForm plugin is included in jsPDF by default, but you need to import it.

---

### Step 2: Import AcroForm in pdfGenerator.ts

**File:** `server/pdfGenerator.ts`

At the top of the file, add the AcroForm import:

```typescript
import { jsPDF } from "jspdf";
import "jspdf/dist/polyfills.es.js"; // Required for some environments

// Import AcroForm plugin
// Note: AcroForm is part of jsPDF core, but needs to be initialized
```

---

### Step 3: Add Checkbox Creation Function

**File:** `server/pdfGenerator.ts`

Add this helper function before the `generateCardPDF` function:

```typescript
/**
 * Add a checkbox form field to the PDF
 * @param doc - jsPDF instance
 * @param x - X position (left edge of checkbox)
 * @param y - Y position (top edge of checkbox)
 * @param size - Size of checkbox in mm
 * @param fieldName - Unique name for this checkbox field
 */
function addCheckbox(
  doc: jsPDF,
  x: number,
  y: number,
  size: number,
  fieldName: string
): void {
  // Create checkbox field
  const checkbox = new (doc as any).AcroFormCheckBox();
  checkbox.fieldName = fieldName;
  checkbox.x = x;
  checkbox.y = y;
  checkbox.width = size;
  checkbox.height = size;
  checkbox.appearanceState = "Off"; // Initially unchecked
  checkbox.value = "Off";
  checkbox.defaultValue = "Off";
  checkbox.caption = ""; // No visible label
  
  // Add to document
  doc.addField(checkbox);
}
```

**Important Notes:**
- `(doc as any).AcroFormCheckBox()` - TypeScript workaround for AcroForm types
- `fieldName` must be unique for each checkbox
- Coordinates are in mm (jsPDF default unit)

---

### Step 4: Modify generateCardPDF to Add Checkboxes

**File:** `server/pdfGenerator.ts`

Find the section where the 5x5 grid is drawn (around line 150-200). After drawing each image square, add a checkbox.

**Current code structure:**
```typescript
// Drawing the 5x5 grid
for (let row = 0; row < gridSize; row++) {
  for (let col = 0; col < gridSize; col++) {
    const x = startX + col * cellSize;
    const y = startY + row * cellSize;
    const index = row * gridSize + col;
    
    // Draw cell border
    doc.rect(x, y, cellSize, cellSize);
    
    // Draw image or FREE space
    if (index === 12) {
      // FREE SPACE - no checkbox
      // ... existing FREE space code ...
    } else {
      // Regular image square
      // ... existing image drawing code ...
      
      // 🆕 ADD CHECKBOX HERE
    }
  }
}
```

**Add checkbox after image drawing:**

```typescript
// Inside the else block (regular image square)
// After the image is drawn:

// Add checkbox in top-right corner of cell
const checkboxSize = 5; // 5mm checkbox
const checkboxPadding = 2; // 2mm from edge
const checkboxX = x + cellSize - checkboxSize - checkboxPadding;
const checkboxY = y + checkboxPadding;
const fieldName = `checkbox_${row}_${col}`; // Unique name

addCheckbox(doc, checkboxX, checkboxY, checkboxSize, fieldName);
```

**Complete modified loop:**

```typescript
for (let row = 0; row < gridSize; row++) {
  for (let col = 0; col < gridSize; col++) {
    const x = startX + col * cellSize;
    const y = startY + row * cellSize;
    const index = row * gridSize + col;
    
    // Draw cell border
    doc.rect(x, y, cellSize, cellSize);
    
    if (index === 12) {
      // FREE SPACE - no checkbox needed
      const freeSpaceImg = await convertImageToBase64(freeSpacePath);
      if (freeSpaceImg) {
        doc.addImage(
          freeSpaceImg,
          "PNG",
          x + imagePadding,
          y + imagePadding,
          imageSize,
          imageSize
        );
      }
    } else {
      // Regular image square
      const image = images[index];
      if (image) {
        const base64 = await convertImageToBase64(image.url);
        if (base64) {
          doc.addImage(
            base64,
            "PNG",
            x + imagePadding,
            y + imagePadding,
            imageSize,
            imageSize
          );
        }
      }
      
      // Add label below image
      doc.setFontSize(7);
      doc.text(
        image?.label || "",
        x + cellSize / 2,
        y + cellSize - 2,
        { align: "center" }
      );
      
      // 🆕 ADD CHECKBOX in top-right corner
      const checkboxSize = 5;
      const checkboxPadding = 2;
      const checkboxX = x + cellSize - checkboxSize - checkboxPadding;
      const checkboxY = y + checkboxPadding;
      const fieldName = `checkbox_${row}_${col}`;
      
      addCheckbox(doc, checkboxX, checkboxY, checkboxSize, fieldName);
    }
  }
}
```

---

### Step 5: Update Player Instructions

**File:** `server/pdfGenerator.ts`

Find the section where player instructions are added (around line 250-280).

**Current instructions:**
```
1. Download Adobe Acrobat Reader
2. Open PDF in Acrobat
3. Use Comments > Drawing Markups > Stamps
```

**Updated instructions:**

```typescript
const instructions = [
  "HOW TO PLAY:",
  "1. Click the checkbox in the top-right corner of each square when called",
  "2. Get 5 in a row (horizontal, vertical, or diagonal) to win",
  "3. Shout 'BINGO!' and show your card to the host",
  "",
  "ALTERNATIVE METHOD:",
  "If checkboxes don't work, use Comments > Stamps in Adobe Reader"
];
```

---

### Step 6: Test the Implementation

#### Test Checklist

- [ ] PDF generates without errors
- [ ] Checkboxes appear in top-right corner of each square
- [ ] FREE SPACE has no checkbox
- [ ] Checkboxes are clickable in Adobe Reader
- [ ] Clicking toggles checkbox on/off
- [ ] Checkbox state persists when saving PDF
- [ ] Test in Chrome PDF viewer
- [ ] Test in Edge PDF viewer
- [ ] Test in Firefox PDF viewer

#### Known Limitations

**Chrome/Edge Built-in Viewers:**
- May have limited AcroForm support
- Checkboxes might not be interactive
- **Workaround:** Instruct users to download and open in Adobe Reader

**Firefox PDF Viewer:**
- Generally good form support
- Should work without issues

**Adobe Reader:**
- Full AcroForm support
- Guaranteed to work

---

## 🧪 Testing Instructions

### Local Testing

1. Start the dev server:
   ```bash
   pnpm dev
   ```

2. Navigate to Host Dashboard

3. Generate a card for 1 player

4. Download the PDF

5. Open in different viewers:
   - Adobe Reader
   - Chrome (drag PDF into browser)
   - Edge (drag PDF into browser)

6. Try clicking checkboxes in each viewer

7. Verify:
   - Checkboxes toggle on/off
   - Position is correct (top-right of each square)
   - FREE SPACE has no checkbox
   - Instructions are updated

### Corporate Environment Testing

1. Generate PDF on dev machine
2. Transfer to corporate machine
3. Test with corporate PDF viewer
4. Document which viewers work/don't work
5. Update instructions accordingly

---

## 🐛 Troubleshooting

### Checkboxes Don't Appear

**Possible Causes:**
- AcroForm plugin not imported correctly
- `addField()` called before `addImage()`
- Coordinates out of page bounds

**Solution:**
- Check import statement
- Ensure checkboxes added after all images
- Log checkbox coordinates to verify

### Checkboxes Not Clickable

**Possible Causes:**
- PDF viewer doesn't support AcroForm
- Checkbox overlapping with image

**Solution:**
- Test in Adobe Reader (guaranteed support)
- Adjust checkbox position/size
- Add instructions to download and open in Adobe

### TypeScript Errors

**Error:** `Property 'AcroFormCheckBox' does not exist on type 'jsPDF'`

**Solution:**
```typescript
// Use type assertion
const checkbox = new (doc as any).AcroFormCheckBox();
```

Or install types:
```bash
pnpm add -D @types/jspdf
```

---

## 📊 Success Criteria

- [ ] Checkboxes render in PDF
- [ ] Checkboxes are interactive in Adobe Reader
- [ ] Position is visually appealing (top-right corner)
- [ ] FREE SPACE has no checkbox
- [ ] Instructions updated
- [ ] No TypeScript errors
- [ ] PDF file size reasonable (<2MB for single card)
- [ ] Works on corporate machines

---

## 🔄 Rollback Plan

If checkboxes don't work in corporate environment:

1. Revert changes to `pdfGenerator.ts`
2. Keep original stamp-based instructions
3. Document which PDF viewers were tested
4. Consider alternative approaches (see `TODO-PDF-CHECKBOXES.md`)

---

## 📝 Commit Instructions

After implementation:

```bash
git add server/pdfGenerator.ts package.json
git commit -m "FEAT: Add interactive checkboxes to PDF bingo cards

- Implement jsPDF AcroForm checkboxes
- Position checkboxes in top-right corner of each square
- Update player instructions with checkbox method
- Add fallback instructions for stamp method
- Tested in Adobe Reader, Chrome, Edge"

git push origin pdf-checkboxes
```

---

## 🎓 Learning Resources

- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [jsPDF AcroForm Examples](https://github.com/parallax/jsPDF/tree/master/examples)
- [PDF Form Fields Spec](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/PDF32000_2008.pdf)

---

## ⏱️ Estimated Time

- Implementation: 2-3 hours
- Testing: 1-2 hours
- **Total: 3-5 hours**

---

*This TODO is optimized for GitHub Copilot - use inline comments and function signatures to guide suggestions.*
