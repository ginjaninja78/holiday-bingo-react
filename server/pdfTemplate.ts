/**
 * HTML template for generating printable bingo cards
 */

export interface CardImage {
  url: string;
  label: string;
}

export interface CardTemplateData {
  cardId: string;
  images: (CardImage | null)[]; // 25 images, null for FREE space
}

export function generateCardHTML(data: CardTemplateData): string {
  const { cardId, images } = data;

  // Generate 5x5 grid cells
  const cells = images
    .map((img, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      const isFreeSpace = row === 2 && col === 2;

      if (isFreeSpace) {
        return `
          <div class="cell free-space">
            <div class="free-text">FREE</div>
          </div>
        `;
      }

      if (!img) {
        return `<div class="cell empty"></div>`;
      }

      return `
        <div class="cell">
          <div class="image-container">
            <img src="${img.url}" alt="${img.label}" />
          </div>
          <div class="label">${img.label}</div>
        </div>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bingo Card ${cardId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: letter;
      margin: 0.5in;
    }

    body {
      font-family: 'Arial', sans-serif;
      background: white;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    .card-container {
      width: 7in;
      max-width: 100%;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
    }

    .title {
      font-size: 36px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 8px;
      letter-spacing: 2px;
    }

    .card-id {
      font-size: 24px;
      font-weight: bold;
      color: #334155;
      font-family: 'Courier New', monospace;
      background: #f1f5f9;
      padding: 8px 16px;
      border-radius: 8px;
      display: inline-block;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      border: 3px solid #1e40af;
      padding: 8px;
      background: white;
      border-radius: 12px;
    }

    .cell {
      aspect-ratio: 1;
      border: 2px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: white;
      position: relative;
    }

    .image-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #f8fafc;
    }

    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .label {
      font-size: 9px;
      text-align: center;
      padding: 4px 2px;
      background: #f1f5f9;
      border-top: 1px solid #e2e8f0;
      font-weight: 500;
      color: #475569;
      line-height: 1.2;
      min-height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .free-space {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      border: 3px solid #d97706;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .free-text {
      font-size: 32px;
      font-weight: bold;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 2px;
    }

    .empty {
      background: #f1f5f9;
    }

    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }

    .instructions {
      margin-top: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .instructions p {
      margin: 4px 0;
      font-size: 10px;
      color: #475569;
    }

    /* Print-specific styles */
    @media print {
      body {
        padding: 0;
      }

      .card-container {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="card-container">
    <div class="header">
      <div class="title">🎄 HOLIDAY BINGO ❄️</div>
      <div class="card-id">Card ID: ${cardId}</div>
    </div>

    <div class="grid">
      ${cells}
    </div>

    <div class="footer">
      <div class="instructions">
        <p><strong>How to Play:</strong></p>
        <p>• Mark off images as they are called by the host</p>
        <p>• Complete the winning pattern to get BINGO!</p>
        <p>• Call out "BINGO!" and provide your Card ID: <strong>${cardId}</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML for multiple cards (multi-page PDF)
 */
export function generateMultiCardHTML(cards: CardTemplateData[]): string {
  const cardHTMLs = cards.map((card) => {
    const { cardId, images } = card;

    const cells = images
      .map((img, index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;
        const isFreeSpace = row === 2 && col === 2;

        if (isFreeSpace) {
          return `
            <div class="cell free-space">
              <div class="free-text">FREE</div>
            </div>
          `;
        }

        if (!img) {
          return `<div class="cell empty"></div>`;
        }

        return `
          <div class="cell">
            <div class="image-container">
              <img src="${img.url}" alt="${img.label}" />
            </div>
            <div class="label">${img.label}</div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="card-container">
        <div class="header">
          <div class="title">🎄 HOLIDAY BINGO ❄️</div>
          <div class="card-id">Card ID: ${cardId}</div>
        </div>

        <div class="grid">
          ${cells}
        </div>

        <div class="footer">
          <div class="instructions">
            <p><strong>How to Play:</strong></p>
            <p>• Mark off images as they are called by the host</p>
            <p>• Complete the winning pattern to get BINGO!</p>
            <p>• Call out "BINGO!" and provide your Card ID: <strong>${cardId}</strong></p>
          </div>
        </div>
      </div>
    `;
  }).join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bingo Cards</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: letter;
      margin: 0.5in;
    }

    body {
      font-family: 'Arial', sans-serif;
      background: white;
    }

    .card-container {
      width: 7in;
      margin: 0 auto;
      padding: 20px;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 9in;
    }

    .card-container:last-child {
      page-break-after: auto;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
    }

    .title {
      font-size: 36px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 8px;
      letter-spacing: 2px;
    }

    .card-id {
      font-size: 24px;
      font-weight: bold;
      color: #334155;
      font-family: 'Courier New', monospace;
      background: #f1f5f9;
      padding: 8px 16px;
      border-radius: 8px;
      display: inline-block;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      border: 3px solid #1e40af;
      padding: 8px;
      background: white;
      border-radius: 12px;
      width: 100%;
    }

    .cell {
      aspect-ratio: 1;
      border: 2px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: white;
      position: relative;
    }

    .image-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #f8fafc;
    }

    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .label {
      font-size: 9px;
      text-align: center;
      padding: 4px 2px;
      background: #f1f5f9;
      border-top: 1px solid #e2e8f0;
      font-weight: 500;
      color: #475569;
      line-height: 1.2;
      min-height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .free-space {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      border: 3px solid #d97706;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .free-text {
      font-size: 32px;
      font-weight: bold;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 2px;
    }

    .empty {
      background: #f1f5f9;
    }

    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      width: 100%;
    }

    .instructions {
      margin-top: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .instructions p {
      margin: 4px 0;
      font-size: 10px;
      color: #475569;
    }
  </style>
</head>
<body>
  ${cardHTMLs}
</body>
</html>
  `;
}
