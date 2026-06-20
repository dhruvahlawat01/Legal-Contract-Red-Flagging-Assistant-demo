// --- Data: Simulated Documents and Risks ---

const contractsData = {
  nda: {
    title: "Mutual_NDA_Draft.pdf",
    charCount: "678 characters",
    // We break the text into parts to insert spans easily
    textParts: [
      `<strong>MUTUAL NON-DISCLOSURE AGREEMENT</strong><br><br>This Mutual Non-Disclosure Agreement (the "Agreement") is entered into by and between Disclosing Party and Receiving Party.<br><br><strong>1. Purpose.</strong> The parties wish to explore a mutually beneficial business relationship.<br><br><strong>2. Confidential Information.</strong> Confidential Information refers to any proprietary data or trade secrets shared under this Agreement.<br><br><strong>3. Term.</strong> `,
      `<span class="hl-risk high" data-id="nda-indefinite">The obligation to preserve and protect all Confidential Information shared under this Agreement shall remain in effect for an indefinite term from the date of initial disclosure.</span>`,
      `<br><br><strong>4. Standard of Care.</strong> The receiving party shall protect the disclosing party's assets with reasonable diligence and care.<br><br><strong>5. Injunctions.</strong> In the event of a breach, `,
      `<span class="hl-risk medium" data-id="nda-bond">the receiving party agrees that any breach of this agreement results in irreparable damage, and hereby waives any requirement for the disclosing party to post bond or prove actual damages to obtain an injunction.</span>`,
      `<br><br><strong>6. Governing Law.</strong> This Agreement shall be governed under the laws of the State of New York.`
    ],
    risks: [
      {
        id: "nda-indefinite",
        level: "high",
        clause: "Indefinite confidentiality term obligation",
        desc: "The contract mandates that obligations to keep information confidential persist indefinitely, rather than expiring after a standard period (typically 2-5 years).",
        rec: "Negotiate a survival term limit (e.g., 3 years post-termination) to avoid permanent liability overhead."
      },
      {
        id: "nda-bond",
        level: "medium",
        clause: "Injunction bond waiver",
        desc: "The clause waives the requirement for the disclosing party to post a bond or prove actual financial damages before seeking injunctive relief in court.",
        rec: "Request striking the waiver so the counterparty must satisfy standard legal burdens of proof prior to securing emergency injunctions."
      }
    ]
  },
  freelance: {
    title: "Freelance_Services_Contract.pdf",
    charCount: "892 characters",
    textParts: [
      `<strong>INDEPENDENT CONTRACTOR SERVICES AGREEMENT</strong><br><br>This Freelance Developer Agreement (the "Agreement") is made between Client Corp and Contractor.<br><br><strong>1. Scope of Work.</strong> Contractor will build custom web features as described in Exhibit A.<br><br><strong>2. Compensation.</strong> Client shall pay Contractor a flat hourly rate of $85.00.<br><br><strong>3. Ownership of Work Product.</strong> `,
      `<span class="hl-risk high" data-id="free-ip">Contractor hereby assigns all rights, title, and interest in and to all Work Product, including all intellectual property rights, whether developed under this contract or prior to the signing of this contract in unrelated capacities, to Client Corp.</span>`,
      `<br><br><strong>4. Non-Compete Restraint.</strong> `,
      `<span class="hl-risk high" data-id="free-noncompete">For a period of two (2) years following the termination of this Agreement, Contractor shall not engage in any business, software development, consulting, or services that compete directly or indirectly with Client Corp globally.</span>`,
      `<br><br><strong>5. Limitation of Liability.</strong> Client Corp's liability is capped at $500. `,
      `<span class="hl-risk medium" data-id="free-liability">Contractor's liability for any intellectual property infringement or general indemnification shall be unlimited.</span>`,
      `<br><br><strong>6. Governing Law.</strong> This Agreement is governed by the laws of California.`
    ],
    risks: [
      {
        id: "free-ip",
        level: "high",
        clause: "Broad Pre-existing IP Forfeiture",
        desc: "The clause attempts to assign intellectual property developed PRIOR to or outside the scope of this contract, seising unrelated work product.",
        rec: "Amend ownership transfer to apply exclusively to 'Work Product developed solely under the Scope of Services of this Agreement'."
      },
      {
        id: "free-noncompete",
        level: "high",
        clause: "Global Post-Termination Non-Compete",
        desc: "This prohibits the contractor from doing any competing software work globally for two years, significantly harming client acquisition freedom.",
        rec: "Demand the removal of the non-compete clause entirely. Freelancers are independent businesses, and non-competes are highly restrictive and often unenforceable."
      },
      {
        id: "free-liability",
        level: "medium",
        clause: "Uncapped Indemnification Liability",
        desc: "Leaves the contractor's liability uncapped for IP infringement claims while capping Client Corp's exposure to a nominal fee ($500).",
        rec: "Propose a mutual, reasonable liability cap (e.g., total fees paid under the contract or 1x contract value)."
      }
    ]
  }
};

// --- DOM References ---
const contractSelect = document.getElementById("contract-select");
const scanBtn = document.getElementById("scan-btn");
const docTitleDisplay = document.getElementById("doc-title-display");
const charCounter = document.getElementById("char-counter");
const documentTextContainer = document.getElementById("document-text-container");
const scanLoadingOverlay = document.getElementById("scan-loading-overlay");
const analysisResultsContainer = document.getElementById("analysis-results-container");
const riskSummaryPill = document.getElementById("risk-summary-pill");

let currentContractKey = null;

// --- Step 1: Select Contract Handler ---
contractSelect.addEventListener("change", (e) => {
  const selectedValue = e.target.value;
  
  if (selectedValue === "none") {
    currentContractKey = null;
    scanBtn.disabled = true;
    docTitleDisplay.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      <span>No document loaded</span>
    `;
    charCounter.innerText = "0 characters";
    documentTextContainer.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        <p>Select a contract draft above to import it into the AI engine</p>
      </div>
    `;
    resetAnalysisResults();
  } else {
    currentContractKey = selectedValue;
    scanBtn.disabled = false;
    const contract = contractsData[selectedValue];
    
    // Set title and char count
    docTitleDisplay.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      <span>${contract.title}</span>
    `;
    charCounter.innerText = contract.charCount;
    
    // Render clean text (without highlight classes applied yet)
    // We strip tags to show raw imported text first
    const cleanText = contract.textParts.map(part => {
      // Create a temporary element to strip span classes/highlights
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = part;
      const spans = tempDiv.querySelectorAll(".hl-risk");
      spans.forEach(s => {
        // Strip out the custom styles/classes but preserve text
        const textNode = document.createTextNode(s.textContent);
        s.parentNode.replaceChild(textNode, s);
      });
      return tempDiv.innerHTML;
    }).join("");
    
    documentTextContainer.innerHTML = `<div style="font-family: var(--font-body); font-size: 0.95rem; line-height: 1.6;">${cleanText}</div>`;
    resetAnalysisResults();
  }
});

function resetAnalysisResults() {
  riskSummaryPill.innerText = "0 Issues Found";
  analysisResultsContainer.innerHTML = `
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      <p style="font-size: 0.85rem;">Run the AI Scan to generate risk card explanations here</p>
    </div>
  `;
}

// --- Step 2: Scan Action with Simulation ---
scanBtn.addEventListener("click", () => {
  if (!currentContractKey) return;
  
  // Show scan overlay
  scanLoadingOverlay.style.display = "flex";
  setTimeout(() => {
    scanLoadingOverlay.style.opacity = "1";
  }, 10);
  
  // Progress scanner texts
  const scanTexts = [
    "Reading file bytes and extracting layout structure...",
    "Splitting document into recursive 500-token chunks...",
    "Querying ChromaDB for relevant risk framework embeddings...",
    "Analyzing matched text segments via Local Llama 3 API...",
    "Formatting detected liabilities and compiling suggestions..."
  ];
  let textIdx = 0;
  const textInterval = setInterval(() => {
    if (textIdx < scanTexts.length - 1) {
      textIdx++;
      scanLoadingOverlay.querySelector(".scan-text").innerText = scanTexts[textIdx];
    }
  }, 350);

  // Complete scan simulation
  setTimeout(() => {
    clearInterval(textInterval);
    
    // Fade out overlay
    scanLoadingOverlay.style.opacity = "0";
    setTimeout(() => {
      scanLoadingOverlay.style.display = "none";
    }, 400);
    
    // Perform scan results rendering
    renderScanResults(currentContractKey);
  }, 1800);
});

// --- Step 3: Render Scanning Results & Interactivity ---
function renderScanResults(contractKey) {
  const contract = contractsData[contractKey];
  
  // 1. Render contract text with active highlight spans
  documentTextContainer.innerHTML = `
    <div style="font-family: var(--font-body); font-size: 0.95rem; line-height: 1.6;">
      ${contract.textParts.join("")}
    </div>
  `;
  
  // 2. Render Risk cards list
  riskSummaryPill.innerText = `${contract.risks.length} Issues Found`;
  analysisResultsContainer.innerHTML = "";
  
  contract.risks.forEach((r, idx) => {
    const card = document.createElement("div");
    card.className = `risk-card`;
    card.setAttribute("data-target-id", r.id);
    card.innerHTML = `
      <div class="risk-card-head">
        <span class="risk-clause-type">${r.clause}</span>
        <span class="risk-badge ${r.level}">${r.level} risk</span>
      </div>
      <div class="risk-card-body">
        <p>${r.desc}</p>
        <div class="risk-rec">
          <strong>ClauseGuard Advice:</strong> ${r.rec}
        </div>
      </div>
    `;
    analysisResultsContainer.appendChild(card);
    
    // Add event listener to card
    card.addEventListener("click", () => {
      setActiveHighlight(r.id);
    });
  });
  
  // 3. Attach click events to the document highlight spans
  const highlights = documentTextContainer.querySelectorAll(".hl-risk");
  highlights.forEach(hl => {
    hl.addEventListener("click", () => {
      const riskId = hl.getAttribute("data-id");
      setActiveHighlight(riskId);
    });
  });

  // Automatically select the first risk card
  if (contract.risks.length > 0) {
    setActiveHighlight(contract.risks[0].id);
  }
}

// Set active highlight across text span and side explanation card
function setActiveHighlight(id) {
  // Reset all highlights in text
  const textHighlights = documentTextContainer.querySelectorAll(".hl-risk");
  textHighlights.forEach(hl => {
    hl.classList.remove("active");
  });
  
  // Reset all cards
  const riskCards = analysisResultsContainer.querySelectorAll(".risk-card");
  riskCards.forEach(card => {
    card.classList.remove("active");
  });
  
  // Set active classes
  const targetHighlight = documentTextContainer.querySelector(`.hl-risk[data-id="${id}"]`);
  if (targetHighlight) {
    targetHighlight.classList.add("active");
    // Scroll text container to view the element smoothly if needed
    targetHighlight.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  
  const targetCard = analysisResultsContainer.querySelector(`.risk-card[data-target-id="${id}"]`);
  if (targetCard) {
    targetCard.classList.add("active");
    targetCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// --- Step 4: Code Library Switcher ---
const codeTabs = document.querySelectorAll(".code-tab");
const codeContents = {
  extractor: document.getElementById("code-content-extractor"),
  chroma: document.getElementById("code-content-chroma"),
  prompt: document.getElementById("code-content-prompt")
};

codeTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    // Reset active tab button
    codeTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    
    // Hide all code bodies
    Object.keys(codeContents).forEach(key => {
      codeContents[key].style.display = "none";
    });
    
    // Show active code body
    const activeTabKey = tab.getAttribute("data-tab");
    if (codeContents[activeTabKey]) {
      codeContents[activeTabKey].style.display = "block";
    }
  });
});

// Add subtle scroll reveal triggers
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section");
  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    if (top < windowHeight * 0.8) {
      sec.classList.add("fade-in");
    }
  });
});
