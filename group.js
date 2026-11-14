// Public identifiers for this campaign.
const pixelId = "";
const groupCapacity = 1000;
const lowAvailabilityThreshold = 15;
// Set this to the latest member count reported by the group admin.
const memberCount = null;

const joinLinks = document.querySelectorAll("[data-join]");

if (Number.isSafeInteger(memberCount) && memberCount >= 0) {
  const number = new Intl.NumberFormat("pt-BR");
  const occupied = Math.min(memberCount, groupCapacity);
  const remaining = groupCapacity - occupied;
  const progress = document.querySelector("#group-progress");
  const availability = document.querySelector("#availability");

  document.querySelector("#remaining").textContent = remaining === 0
    ? "Limite de vagas atingido"
    : `${number.format(remaining)} ${remaining === 1 ? "vaga disponível" : "vagas disponíveis"}`;
  document.querySelector("#occupancy").textContent =
    `${number.format(occupied)} de ${number.format(groupCapacity)} vagas ocupadas`;
  progress.max = groupCapacity;
  progress.value = occupied;
  availability.classList.toggle("availability-low", remaining > 0 && remaining <= lowAvailabilityThreshold);
  document.querySelector("#availability-note").hidden = true;
  availability.hidden = false;
}

if (/^\d{5,25}$/.test(pixelId)) {
  const consentKey = "achadinhos-jr-meta-consent";
  const preferences = document.querySelector("#privacy-button");
  const dialog = document.querySelector("#privacy");
  let consent;
  let pixelStarted = false;

  try {
    consent = localStorage.getItem(consentKey);
  } catch {
    // Preferences still apply until this page is closed.
  }

  function startPixel() {
    if (pixelStarted) return;
    pixelStarted = true;
    const pixel = function () {
      if (pixel.callMethod) pixel.callMethod.apply(pixel, arguments);
      else pixel.queue.push(arguments);
    };
    pixel.push = pixel;
    pixel.loaded = true;
    pixel.version = "2.0";
    pixel.queue = [];
    window.fbq = window._fbq = pixel;

    pixel("init", pixelId);
    pixel("track", "PageView");

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.append(script);
  }

  function saveChoice(choice) {
    consent = choice;
    try {
      localStorage.setItem(consentKey, choice);
    } catch {
      // The preference is stored in memory for this visit.
    }
    if (choice === "accepted") {
      if (pixelStarted) window.fbq("consent", "grant");
      else startPixel();
    } else if (pixelStarted) {
      window.fbq("consent", "revoke");
    }
    dialog.close();
  }

  preferences.hidden = false;
  preferences.addEventListener("click", () => dialog.showModal());
  document.querySelector("#decline").addEventListener("click", () => saveChoice("declined"));
  document.querySelector("#accept").addEventListener("click", () => saveChoice("accepted"));
  if (consent === "accepted") startPixel();
  if (!consent) dialog.showModal();

  for (const link of joinLinks) {
    link.addEventListener("click", () => {
      if (link.hasAttribute("href") && consent === "accepted" && pixelStarted) {
        window.fbq("track", "Lead");
      }
    });
  }
}
