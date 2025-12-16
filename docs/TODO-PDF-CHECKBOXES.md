# TODO: PDF Interactive Checkboxes for Bingo Cards

## Overview
Replace the current "stamp" marking system with interactive PDF form checkboxes that users can click to mark squares as played. This provides a much cleaner UX - one click to mark, one click to unmark.

---

## Current State
- Cards use Adobe Acrobat's stamp/comment system for marking
- Requires users to navigate: Comments > Drawing Markups > Stamps
- Reset requires: Tools > Comments > Clear All
- Not intuitive for non-technical users

## Target State
- Each bingo square has an invisible checkbox overlay
- Single click toggles the "marked" state
- Visual indicator appears when marked (checkmark, X, or highlight)
- Optional: "Reset All" button embedded in PDF
- Works in Adobe Reader, Chrome PDF viewer, and most PDF readers

---

## Implementation Steps

### Phase 1: Research & Proof of Concept
- [ ] **1.1** Research jsPDF AcroForm support
  - jsPDF has `addField()` method for form fields
  - Check: https://github.com/parallax/jsPDF/blob/master/types/index.d.ts
  - Look for: `AcroFormCheckBox`, `AcroFormButton`
  
- [ ] **1.2** Create minimal test PDF with one checkbox
  ```typescript
  import { jsPDF } from "jspdf";
  
  const doc = new jsPDF();
  
  // Add a checkbox field
  const checkBox = new doc.AcroFormCheckBox();
  checkBox.fieldName = "square_0_0";
  checkBox.x = 50;
  checkBox.y = 50;
  checkBox.width = 30;
  checkBox.height = 30;
  checkBox.appearanceState = "Off"; // or "Yes" for checked
  doc.addField(checkBox);
  
  doc.save("test-checkbox.pdf");
  ```

- [ ] **1.3** Test checkbox in multiple PDF viewers
  - Adobe Acrobat Reader
  - Chrome built-in PDF viewer
  - Firefox PDF viewer
  - Preview (macOS)
  - Edge PDF viewer

### Phase 2: Design Checkbox Appearance
- [ ] **2.1** Decide on visual style when checked:
  - Option A: Simple checkmark (✓)
  - Option B: X mark
  - Option C: Filled/highlighted background
  - Option D: Semi-transparent overlay color
  
- [ ] **2.2** Ensure checkbox doesn't obscure the image
  - Checkbox should be transparent when unchecked
  - Only show visual indicator when checked
  
- [ ] **2.3** Consider accessibility
  - Sufficient contrast when marked
  - Clear visual distinction

### Phase 3: Integrate into pdfGenerator.ts
- [ ] **3.1** Modify `generateCardPDF()` function
  - After drawing each cell, add checkbox overlay
  - Skip FREE SPACE (already marked)
  
- [ ] **3.2** Create helper function for checkbox creation
  ```typescript
  function addCellCheckbox(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    fieldName: string
  ): void {
    const checkBox = new doc.AcroFormCheckBox();
    checkBox.fieldName = fieldName;
    checkBox.x = x;
    checkBox.y = y;
    checkBox.width = width;
    checkBox.height = height;
    checkBox.appearanceState = "Off";
    // Style options
    checkBox.borderStyle = "none"; // or "solid", "dashed"
    checkBox.borderWidth = 0;
    doc.addField(checkBox);
  }
  ```

- [ ] **3.3** Generate unique field names per card
  - Format: `card_{cardId}_row_{row}_col_{col}`
  - Example: `card_A3K7P_row_0_col_0`

- [ ] **3.4** Handle FREE SPACE specially
  - Either: Pre-check the checkbox
  - Or: Don't add checkbox (already "won")

### Phase 4: Add Reset Functionality
- [ ] **4.1** Option A: JavaScript Reset Button (if supported)
  ```typescript
  // Add a reset button
  const resetBtn = new doc.AcroFormButton();
  resetBtn.fieldName = "reset_all";
  resetBtn.caption = "Reset Card";
  resetBtn.x = 80;
  resetBtn.y = 280;
  resetBtn.width = 50;
  resetBtn.height = 10;
  // Add JavaScript action to reset all checkboxes
  doc.addField(resetBtn);
  ```

- [ ] **4.2** Option B: Instructions for manual reset
  - Keep current instructions if JS not widely supported
  - "To reset: File > Revert to Saved" or re-download

### Phase 5: Testing & Validation
- [ ] **5.1** Generate test cards with checkboxes
- [ ] **5.2** Test in all target PDF viewers
- [ ] **5.3** Verify checkboxes don't affect print quality
- [ ] **5.4** Test with multiple cards in single PDF
- [ ] **5.5** Verify unique field names don't conflict

### Phase 6: Update Player Instructions
- [ ] **6.1** Update instructions text in PDF
  - Old: "To Mark: Comments > Drawing Markups > Stamps..."
  - New: "To Mark: Click any square to mark it as played"
  
- [ ] **6.2** Update any UI text referencing marking method

---

## Technical Notes

### jsPDF AcroForm Documentation
- Main docs: https://raw.githack.com/AcroForm/jsPDF/master/docs/index.html
- AcroForm plugin is included in jsPDF by default
- Import: `import { jsPDF } from "jspdf";` (AcroForm auto-included)

### Checkbox Appearance States
- `"Off"` - Unchecked
- `"Yes"` - Checked (default check appearance)
- Custom appearances can be defined with `createDefaultAppearanceStream()`

### PDF Coordinate System
- Origin (0,0) is BOTTOM-LEFT in PDF spec
- jsPDF uses TOP-LEFT by default
- Be aware of coordinate transformation

### Known Limitations
- Some PDF viewers may not support form fields
- Chrome PDF viewer has limited form support
- Consider fallback instructions for unsupported viewers

---

## Alternative Approaches (If AcroForm Doesn't Work)

### Alternative 1: Annotation-based Marking
- Use PDF annotations instead of form fields
- More widely supported but less interactive

### Alternative 2: Web-based Card Viewer
- Instead of PDF, use an interactive web page
- Player opens URL, clicks squares on screen
- State saved in browser localStorage
- Can sync with backend for host tracking

### Alternative 3: Hybrid Approach
- Generate PDF for printing
- Provide web link for digital play
- Both reference same Card ID

---

## Files to Modify
1. `server/pdfGenerator.ts` - Main implementation
2. `server/pdfRouter.ts` - No changes expected
3. `docs/TODO-PDF-CHECKBOXES.md` - This file (update as completed)

---

## Success Criteria
- [ ] Checkboxes work in Adobe Reader
- [ ] Checkboxes work in Chrome PDF viewer
- [ ] Visual marking is clear and doesn't obscure images
- [ ] Multiple cards in one PDF have independent checkboxes
- [ ] Instructions updated to reflect new marking method
- [ ] No regression in print quality

---

## Estimated Effort
- Phase 1 (Research): 1-2 hours
- Phase 2 (Design): 30 minutes
- Phase 3 (Implementation): 2-3 hours
- Phase 4 (Reset): 1 hour
- Phase 5 (Testing): 1-2 hours
- Phase 6 (Instructions): 30 minutes

**Total: 6-9 hours**

---

## Questions to Resolve
1. Should FREE SPACE be pre-checked or have no checkbox?
2. What visual style for checked state? (checkmark vs X vs highlight)
3. Is a Reset button necessary or just instructions?
4. Should we support a "print mode" without checkboxes for physical play?
