import React, { useState, useMemo, useEffect, useId } from "react";
import { supabase, hasSupabase } from "./lib/supabase";

/*
  THE BLACK TIER — Private Acquisition Office
  Public: landing + a deep, multi-step confidential search brief. No login.
  Hidden CRM: not in the nav. Reachable only via the secret hash route
  (#office) + passcode — stands in for a backend-protected admin area.
  The Matching Agent cross-references briefs with off-market objects and
  produces a censored teaser; email flows are simulated in an Outbox.
  Front-end prototype: data lives in the session.

  Design: a quiet, couture interface — warm noir, hallmark gold, fine
  typography, restrained motion. Discretion expressed as craft.
*/

// ---------------- i18n ----------------
const T = {
  de: {
    tagline: "Privates Akquisitions-Office",
    heroPlace: "Schweiz",
    mark_offmarket: "Off-Market", mark_confidential: "Vertraulich", mark_personal: "Persönlich",
    nav_how: "So funktioniert es", nav_request: "Suchprofil", nav_disc: "Diskretion",
    hero1: "Wir suchen,", hero2: "was verborgen bleibt.",
    heroSub: "Ein privates Akquisitionshaus für anspruchsvolle Käufer, die aussergewöhnliche Werte ausserhalb des Marktes erwerben möchten — Liegenschaften und Projekte ebenso wie Yachten, Automobile, seltene Uhren, Edelmetalle, Energie- und Krypto-Werte sowie vertrauliche Sondermandate. Kein Inserat, keine Anmeldung — ein vertrauliches Gesuch, persönlich bearbeitet.",
    heroCta: "Suchprofil eröffnen",
    heroNote: "Sämtliche Korrespondenz erfolgt ausschliesslich und diskret per E-Mail.",
    mandateTitle: "So funktioniert es",
    m1t: "Gesuch eröffnen", m1d: "Ohne Konto. Sie schildern, wer Sie sind und was Sie erwerben möchten — und wie wir Sie erreichen.",
    m2t: "Stiller Abgleich", m2d: "Ihr Profil wird vertraulich mit unserem Off-Market-Bestand abgeglichen. Ihr Gesuch verlässt das Office nicht.",
    m3t: "Zensiertes Dossier", m3d: "Passt ein Objekt, erhalten Sie Eckdaten ohne Adresse oder Identität — genug zur Beurteilung Ihres Interesses.",
    m4t: "Begleitung bis zum Abschluss", m4d: "Bei Interesse koordinieren wir Besichtigung und Verhandlung diskret zwischen den Parteien und begleiten Sie persönlich bis zum Abschluss. Ihre Anfrage verlässt das Office nicht.",
    discTitle: "Diskretion ist die Methode",
    discBody: "Wir führen kein öffentliches Verzeichnis. Verkäufer vertrauen uns Objekte an, die nie inseriert werden sollen; Käufer vertrauen uns ihre Absicht an. Beide Seiten bleiben geschützt, bis ein gegenseitiges Interesse besteht. Erst dann werden Identitäten offengelegt — behutsam, unter unserer Begleitung und nie öffentlich. Wir bleiben bis zum Abschluss an Ihrer Seite.",
    step: "Schritt", of: "von",
    fs1: "Über Sie", fs2: "Was Sie suchen", fs3: "Feinheiten & Kontakt",
    fName: "Vollständiger Name", fEmail: "E-Mail", fPhone: "Telefon (optional)",
    fBuyerType: "Sie handeln als", bt_private: "Privatperson", bt_family: "Family Office", bt_company: "Unternehmen", bt_investor: "Investor", bt_rep: "Vertreter / Treuhänder",
    fResidence: "Wohnsitz / Land", fHorizon: "Erwerbshorizont",
    hz_now: "Sofort", hz_6m: "Innert 6 Monaten", hz_12m: "Innert 12 Monaten", hz_open: "Offen / opportunistisch",
    fFinance: "Finanzierung", fin_cash: "Eigenmittel", fin_mortgage: "Hypothek", fin_mixed: "Gemischt", fin_tbd: "Noch offen",
    fTypes: "Kategorie (Mehrfachauswahl)",
    catRealLux: "Luxusimmobilien", catRealLarge: "Grosse Immobilien / Projekte", catYacht: "Yachten",
    catCar: "Automobile / Sammlerwagen", catWatch: "Uhren", catGold: "Gold & Edelmetalle",
    catOil: "Öl & Energie", catCrypto: "Krypto-Assets", catSpecial: "Sonderanfrage",
    fRegions: "Bevorzugte Regionen (Mehrfachauswahl)",
    fRegionAdd: "Land / Region hinzufügen …",
    rg_swiss: "Schweiz", rg_monaco: "Monaco", rg_riviera: "Côte d'Azur", rg_london: "London",
    rg_dubai: "Dubai", rg_newyork: "New York", rg_miami: "Miami", rg_singapore: "Singapur",
    rg_hongkong: "Hongkong", rg_caribbean: "Karibik", rg_intl: "International / weltweit",
    fBudget: "Budgetspanne (CHF)", fBudgetFrom: "von", fBudgetTo: "bis",
    fFeatures: "Wichtige Merkmale (Mehrfachauswahl)",
    ft_lake: "Seesicht / Seezugang", ft_mountain: "Bergsicht", ft_privacy: "Maximale Privatsphäre",
    ft_newbuild: "Neubau / neuwertig", ft_historic: "Historisch / Charakter", ft_land: "Viel Umschwung",
    ft_pool: "Pool / Wellness", ft_staff: "Personalräume", ft_dock: "Bootssteg / Hafen", ft_security: "Sicherheitsstandard",
    fRoomsMin: "Zimmer / Einheiten (min.)", fAreaMin: "Wohnfläche min. (m²)", fPlotMin: "Grundstück min. (m²)",
    fDetail: "Genaue Vorstellung", fDetailPh: "Beschreiben Sie so präzise wie möglich, was Sie suchen — Stil, Ausrichtung, Zustand, Ausschlusskriterien, besondere Wünsche, Zeithorizont …",
    fDiscretion: "Diskretionsstufe", dsc_normal: "Standard", dsc_high: "Erhöht", dsc_max: "Absolut (nur direkter Kontakt)",
    fContactPref: "Bevorzugter Kontaktweg", cp_email: "Nur E-Mail", cp_phone: "E-Mail & Telefon",
    back: "Zurück", next: "Weiter", submit: "Vertraulich übermitteln",
    chooseOne: "Bitte mindestens eine Option wählen", required: "Bitte ausfüllen",
    sent: "Eingegangen — vertraulich.", sentSub: "Ihr Gesuch ist eröffnet. Wir prüfen es und melden uns ausschliesslich per E-Mail.",
    sentAgain: "Weiteres Gesuch eröffnen",
    crmTitle: "Office", crmSub: "Zugang ausschliesslich für das Office.",
    crmPass: "Zugangscode", crmEnter: "Öffnen", crmWrong: "Code nicht korrekt.", crmHint: "Demo-Code: 4321",
    crmExit: "Office schliessen",
    tabObjects: "Bestand", tabBriefs: "Gesuche", tabAgent: "Agent", tabOutbox: "Postausgang",
    addObject: "Off-Market-Objekt erfassen",
    oTitle: "Interne Bezeichnung", oType: "Art", oRegion: "Region", oAddress: "Adresse (intern, vertraulich)",
    oPrice: "Preis (CHF)", oRooms: "Zimmer / Einheiten", oArea: "Wohnfläche m²", oPlot: "Grundstück m²",
    oBroker: "Makler (Name)", oBrokerEmail: "Makler E-Mail", oDesc: "Interne Beschreibung", save: "In Bestand speichern",
    noObjects: "Noch keine Objekte erfasst.", noBriefs: "Noch keine Gesuche eingegangen.",
    runAgent: "Abgleich starten", agentIntro: "Der Agent vergleicht jedes Gesuch mit dem Bestand und schlägt Treffer vor. Sie geben frei, was gesendet wird.",
    match: "Treffer", noMatch: "Keine Treffer", score: "Übereinstimmung",
    releaseTeaser: "Zensiertes Dossier senden", released: "Gesendet",
    handover: "Makler kontaktieren", handedOver: "Koordiniert",
    teaserPreview: "Dossier (zensiert)", outboxEmpty: "Noch keine Nachrichten versendet.",
    to: "An", subject: "Betreff", censored: "Adresse & Identität auf Anfrage", confidential: "Vertraulich",
    buyer: "Käufer", seeks: "sucht",
    coordSubject: "Koordination", coordIntro: "Vertraulich. Ein geprüfter Interessent aus unserem Office zeigt Interesse an folgendem Objekt. Wir bleiben alleinige Kontaktstelle und koordinieren das weitere Vorgehen; bitte stimmen Sie eine diskrete Besichtigung mit uns ab. Die Identität des Interessenten wird erst bei beidseitigem Interesse und unter unserer Begleitung offengelegt.",
    coordObject: "Objekt", coordProfile: "Profil des Interessenten (anonymisiert)", coordVia: "Kontakt ausschliesslich über The Black Tier",
  },
  en: {
    tagline: "Private Acquisition Office",
    heroPlace: "Switzerland",
    mark_offmarket: "Off-market", mark_confidential: "Confidential", mark_personal: "In person",
    nav_how: "How it works", nav_request: "Search profile", nav_disc: "Discretion",
    hero1: "We source", hero2: "what stays hidden.",
    heroSub: "A private acquisition house for discerning buyers acquiring exceptional assets off the market — properties and projects as much as yachts, automobiles, rare watches, precious metals, energy and crypto holdings, and confidential special mandates. No listing, no account — one confidential brief, handled in person.",
    heroCta: "Open a search profile",
    heroNote: "All correspondence is handled solely and discreetly by email.",
    mandateTitle: "How it works",
    m1t: "Open a brief", m1d: "No account. Tell us who you are and what you wish to acquire — and how to reach you.",
    m2t: "Quiet matching", m2d: "Your profile is confidentially cross-referenced with our off-market holdings. Your brief never leaves the office.",
    m3t: "Censored dossier", m3d: "If something fits, you receive key data without address or identity — enough to judge your interest.",
    m4t: "Accompaniment to closing", m4d: "On interest, we coordinate viewing and negotiation discreetly between the parties and accompany you in person through to closing. Your request never leaves the office.",
    discTitle: "Discretion is the method",
    discBody: "We keep no public register. Sellers entrust us with objects that must never be listed; buyers entrust us with their intent. Both sides stay protected until mutual interest exists. Only then are identities revealed — carefully, under our guidance and never publicly. We remain at your side through to closing.",
    step: "Step", of: "of",
    fs1: "About you", fs2: "What you seek", fs3: "Details & contact",
    fName: "Full name", fEmail: "Email", fPhone: "Phone (optional)",
    fBuyerType: "You act as", bt_private: "Private individual", bt_family: "Family office", bt_company: "Company", bt_investor: "Investor", bt_rep: "Representative / trustee",
    fResidence: "Residence / country", fHorizon: "Acquisition horizon",
    hz_now: "Immediately", hz_6m: "Within 6 months", hz_12m: "Within 12 months", hz_open: "Open / opportunistic",
    fFinance: "Financing", fin_cash: "Own funds", fin_mortgage: "Mortgage", fin_mixed: "Mixed", fin_tbd: "To be defined",
    fTypes: "Category (multiple)",
    catRealLux: "Luxury real estate", catRealLarge: "Large real estate / projects", catYacht: "Yachts",
    catCar: "Automobiles / collector cars", catWatch: "Watches", catGold: "Gold & precious metals",
    catOil: "Oil & energy", catCrypto: "Crypto assets", catSpecial: "Special request",
    fRegions: "Preferred regions (multiple)",
    fRegionAdd: "Add country / region …",
    rg_swiss: "Switzerland", rg_monaco: "Monaco", rg_riviera: "French Riviera", rg_london: "London",
    rg_dubai: "Dubai", rg_newyork: "New York", rg_miami: "Miami", rg_singapore: "Singapore",
    rg_hongkong: "Hong Kong", rg_caribbean: "Caribbean", rg_intl: "International / worldwide",
    fBudget: "Budget range (CHF)", fBudgetFrom: "from", fBudgetTo: "to",
    fFeatures: "Key features (multiple)",
    ft_lake: "Lake view / access", ft_mountain: "Mountain view", ft_privacy: "Maximum privacy",
    ft_newbuild: "New / as-new", ft_historic: "Historic / character", ft_land: "Generous grounds",
    ft_pool: "Pool / wellness", ft_staff: "Staff quarters", ft_dock: "Dock / harbour", ft_security: "Security standard",
    fRoomsMin: "Rooms / units (min.)", fAreaMin: "Living area min. (m²)", fPlotMin: "Plot min. (m²)",
    fDetail: "Precise brief", fDetailPh: "Describe as precisely as possible what you seek — style, orientation, condition, exclusions, special wishes, timeframe …",
    fDiscretion: "Discretion level", dsc_normal: "Standard", dsc_high: "Elevated", dsc_max: "Absolute (direct contact only)",
    fContactPref: "Preferred contact", cp_email: "Email only", cp_phone: "Email & phone",
    back: "Back", next: "Continue", submit: "Submit confidentially",
    chooseOne: "Please choose at least one", required: "Required",
    sent: "Received — in confidence.", sentSub: "Your brief is open. We'll review it and reply by email only.",
    sentAgain: "Open another brief",
    crmTitle: "Office", crmSub: "Office access only.",
    crmPass: "Access code", crmEnter: "Open", crmWrong: "Incorrect code.", crmHint: "Demo code: 4321",
    crmExit: "Close office",
    tabObjects: "Holdings", tabBriefs: "Briefs", tabAgent: "Agent", tabOutbox: "Outbox",
    addObject: "Add off-market object",
    oTitle: "Internal name", oType: "Type", oRegion: "Region", oAddress: "Address (internal, confidential)",
    oPrice: "Price (CHF)", oRooms: "Rooms / units", oArea: "Living area m²", oPlot: "Plot m²",
    oBroker: "Broker (name)", oBrokerEmail: "Broker email", oDesc: "Internal description", save: "Save to holdings",
    noObjects: "No objects yet.", noBriefs: "No briefs yet.",
    runAgent: "Run matching", agentIntro: "The agent compares each brief with the holdings and proposes matches. You release what gets sent.",
    match: "Match", noMatch: "No matches", score: "Match",
    releaseTeaser: "Send censored dossier", released: "Sent",
    handover: "Contact broker", handedOver: "Coordinating",
    teaserPreview: "Dossier (censored)", outboxEmpty: "No messages sent yet.",
    to: "To", subject: "Subject", censored: "Address & identity on request", confidential: "Confidential",
    buyer: "Buyer", seeks: "seeks",
    coordSubject: "Coordination", coordIntro: "Confidential. A vetted party from our office is interested in the following object. We remain the sole point of contact and coordinate next steps; please arrange a discreet viewing with us. The party's identity is disclosed only on mutual interest and under our guidance.",
    coordObject: "Object", coordProfile: "Party profile (anonymised)", coordVia: "Contact via The Black Tier only",
  },
  fr: {
    tagline: "Bureau d'acquisition privé",
    heroPlace: "Suisse",
    mark_offmarket: "Hors marché", mark_confidential: "Confidentiel", mark_personal: "En personne",
    nav_how: "Comment ça marche", nav_request: "Profil de recherche", nav_disc: "Discrétion",
    hero1: "Nous trouvons", hero2: "ce qui reste caché.",
    heroSub: "Une maison d'acquisition privée pour des acquéreurs exigeants, à la recherche de biens d'exception hors marché — biens immobiliers et projets, mais aussi yachts, automobiles, montres rares, métaux précieux, actifs énergétiques et crypto, ainsi que mandats spéciaux confidentiels. Aucune annonce, aucun compte — une demande confidentielle, traitée en personne.",
    heroCta: "Ouvrir un profil de recherche",
    heroNote: "Toute la correspondance se fait uniquement et discrètement par e-mail.",
    mandateTitle: "Comment ça marche",
    m1t: "Ouvrir une demande", m1d: "Sans compte. Dites-nous qui vous êtes et ce que vous souhaitez acquérir — et comment vous joindre.",
    m2t: "Mise en correspondance silencieuse", m2d: "Votre profil est comparé en confidentialité à nos biens hors marché. Votre demande ne quitte pas le bureau.",
    m3t: "Dossier censuré", m3d: "Si un bien convient, vous recevez les données clés sans adresse ni identité — de quoi juger votre intérêt.",
    m4t: "Accompagnement jusqu'à la conclusion", m4d: "En cas d'intérêt, nous coordonnons visite et négociation discrètement entre les parties et vous accompagnons en personne jusqu'à la conclusion. Votre demande ne quitte pas le bureau.",
    discTitle: "La discrétion est la méthode",
    discBody: "Nous ne tenons aucun registre public. Les vendeurs nous confient des biens qui ne doivent jamais être annoncés ; les acquéreurs nous confient leur intention. Les deux parties restent protégées jusqu'à l'existence d'un intérêt mutuel. Ce n'est qu'alors que les identités sont révélées — avec précaution, sous notre accompagnement et jamais publiquement. Nous restons à vos côtés jusqu'à la conclusion.",
    step: "Étape", of: "sur",
    fs1: "À votre sujet", fs2: "Ce que vous cherchez", fs3: "Détails & contact",
    fName: "Nom complet", fEmail: "E-mail", fPhone: "Téléphone (facultatif)",
    fBuyerType: "Vous agissez en tant que", bt_private: "Particulier", bt_family: "Family office", bt_company: "Entreprise", bt_investor: "Investisseur", bt_rep: "Représentant / fiduciaire",
    fResidence: "Résidence / pays", fHorizon: "Horizon d'acquisition",
    hz_now: "Immédiatement", hz_6m: "Sous 6 mois", hz_12m: "Sous 12 mois", hz_open: "Ouvert / opportuniste",
    fFinance: "Financement", fin_cash: "Fonds propres", fin_mortgage: "Hypothèque", fin_mixed: "Mixte", fin_tbd: "À définir",
    fTypes: "Catégorie (plusieurs)",
    catRealLux: "Immobilier de luxe", catRealLarge: "Grands biens / projets", catYacht: "Yachts",
    catCar: "Automobiles / collection", catWatch: "Montres", catGold: "Or & métaux précieux",
    catOil: "Pétrole & énergie", catCrypto: "Actifs crypto", catSpecial: "Demande spéciale",
    fRegions: "Régions préférées (plusieurs)",
    fRegionAdd: "Ajouter un pays / une région …",
    rg_swiss: "Suisse", rg_monaco: "Monaco", rg_riviera: "Côte d'Azur", rg_london: "Londres",
    rg_dubai: "Dubaï", rg_newyork: "New York", rg_miami: "Miami", rg_singapore: "Singapour",
    rg_hongkong: "Hong Kong", rg_caribbean: "Caraïbes", rg_intl: "International / mondial",
    fBudget: "Fourchette de budget (CHF)", fBudgetFrom: "de", fBudgetTo: "à",
    fFeatures: "Caractéristiques clés (plusieurs)",
    ft_lake: "Vue / accès lac", ft_mountain: "Vue montagne", ft_privacy: "Intimité maximale",
    ft_newbuild: "Neuf / état neuf", ft_historic: "Historique / caractère", ft_land: "Vaste terrain",
    ft_pool: "Piscine / wellness", ft_staff: "Logement du personnel", ft_dock: "Ponton / port", ft_security: "Standard de sécurité",
    fRoomsMin: "Pièces / unités (min.)", fAreaMin: "Surface hab. min. (m²)", fPlotMin: "Terrain min. (m²)",
    fDetail: "Cahier des charges précis", fDetailPh: "Décrivez le plus précisément possible ce que vous cherchez — style, orientation, état, exclusions, souhaits particuliers, horizon …",
    fDiscretion: "Niveau de discrétion", dsc_normal: "Standard", dsc_high: "Élevé", dsc_max: "Absolu (contact direct uniquement)",
    fContactPref: "Contact préféré", cp_email: "E-mail uniquement", cp_phone: "E-mail & téléphone",
    back: "Retour", next: "Continuer", submit: "Envoyer en confidentialité",
    chooseOne: "Veuillez choisir au moins une option", required: "Requis",
    sent: "Reçu — en toute confidentialité.", sentSub: "Votre demande est ouverte. Nous l'étudions et répondons uniquement par e-mail.",
    sentAgain: "Ouvrir une autre demande",
    crmTitle: "Bureau", crmSub: "Accès réservé au bureau.",
    crmPass: "Code d'accès", crmEnter: "Ouvrir", crmWrong: "Code incorrect.", crmHint: "Code démo : 4321",
    crmExit: "Fermer le bureau",
    tabObjects: "Portefeuille", tabBriefs: "Demandes", tabAgent: "Agent", tabOutbox: "Sortie",
    addObject: "Ajouter un objet hors marché",
    oTitle: "Désignation interne", oType: "Type", oRegion: "Région", oAddress: "Adresse (interne, confidentielle)",
    oPrice: "Prix (CHF)", oRooms: "Pièces / unités", oArea: "Surface hab. m²", oPlot: "Terrain m²",
    oBroker: "Courtier (nom)", oBrokerEmail: "E-mail courtier", oDesc: "Description interne", save: "Enregistrer",
    noObjects: "Aucun objet pour l'instant.", noBriefs: "Aucune demande pour l'instant.",
    runAgent: "Lancer la correspondance", agentIntro: "L'agent compare chaque demande au portefeuille et propose des correspondances. Vous validez ce qui est envoyé.",
    match: "Correspondance", noMatch: "Aucune correspondance", score: "Affinité",
    releaseTeaser: "Envoyer le dossier censuré", released: "Envoyé",
    handover: "Contacter le courtier", handedOver: "Coordonné",
    teaserPreview: "Dossier (censuré)", outboxEmpty: "Aucun message envoyé.",
    to: "À", subject: "Objet", censored: "Adresse et identité sur demande", confidential: "Confidentiel",
    buyer: "Acquéreur", seeks: "recherche",
    coordSubject: "Coordination", coordIntro: "Confidentiel. Une partie vérifiée de notre bureau s'intéresse à l'objet suivant. Nous restons l'unique point de contact et coordonnons les prochaines étapes ; merci d'organiser une visite discrète avec nous. L'identité de la partie n'est révélée qu'en cas d'intérêt mutuel et sous notre accompagnement.",
    coordObject: "Objet", coordProfile: "Profil de la partie (anonymisé)", coordVia: "Contact uniquement via The Black Tier",
  },
};

const TYPE_KEYS = ["realLux", "realLarge", "yacht", "car", "watch", "gold", "oil", "crypto", "special"];
const typeLabel = (t, k) => ({
  realLux: t.catRealLux, realLarge: t.catRealLarge, yacht: t.catYacht, car: t.catCar, watch: t.catWatch,
  gold: t.catGold, oil: t.catOil, crypto: t.catCrypto, special: t.catSpecial,
}[k] || k);
const RE_CATS = ["realLux", "realLarge"];
const REGION_KEYS = ["swiss", "monaco", "riviera", "london", "dubai", "newyork", "miami", "singapore", "hongkong", "caribbean", "intl"];
const regionLabel = (t, k) => t["rg_" + k] || k;
const FEATURE_KEYS = ["lake", "mountain", "privacy", "newbuild", "historic", "land", "pool", "staff", "dock", "security"];
const featureLabel = (t, k) => t["ft_" + k] || k;

const fmtCHF = (n) => (n ? "CHF " + Number(n).toLocaleString("de-CH") : "—");

// ---------------- worldwide regions (ISO country codes, localized) ----------------
const COUNTRY_CODES = ["AD","AE","AF","AG","AL","AM","AO","AR","AT","AU","AW","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BN","BO","BR","BS","BT","BW","BY","BZ","CA","CD","CF","CG","CH","CI","CL","CM","CN","CO","CR","CU","CV","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","ER","ES","ET","FI","FJ","FM","FR","GA","GB","GD","GE","GH","GI","GM","GN","GQ","GR","GT","GW","GY","HK","HN","HR","HT","HU","ID","IE","IL","IN","IQ","IR","IS","IT","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MG","MH","MK","ML","MM","MN","MO","MQ","MR","MT","MU","MV","MW","MX","MY","MZ","NA","NC","NE","NG","NI","NL","NO","NP","NR","NZ","OM","PA","PE","PF","PG","PH","PK","PL","PR","PT","PW","PY","QA","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SI","SK","SL","SM","SN","SO","SR","SS","ST","SV","SY","SZ","TC","TD","TG","TH","TJ","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA","UG","US","UY","UZ","VA","VC","VE","VG","VN","VU","WS","YE","ZA","ZM","ZW"];
function regionName(lang, code) {
  if (!code) return "";
  if (code === "WORLD") return (T[lang] && T[lang].rg_intl) || "International";
  try { return new Intl.DisplayNames([lang], { type: "region" }).of(code) || code; }
  catch (e) { return code; }
}
function regionOptions(lang) {
  let dn = null;
  try { dn = new Intl.DisplayNames([lang], { type: "region" }); } catch (e) { dn = null; }
  return COUNTRY_CODES
    .map((c) => ({ code: c, name: dn ? (dn.of(c) || c) : c }))
    .sort((a, b) => a.name.localeCompare(b.name, lang));
}

// ---------------- matching agent ----------------
function scoreMatch(brief, obj) {
  let score = 0, max = 0;
  max += 40;
  if (Array.isArray(brief.types) && brief.types.includes(obj.type)) score += 40;
  max += 35;
  const bmin = Number(brief.budgetFrom) || 0;
  const bmax = Number(brief.budgetTo) || Infinity;
  if (obj.price >= bmin && obj.price <= bmax) score += 35;
  else if (obj.price <= bmax * 1.1 && obj.price >= bmin * 0.9) score += 18;
  max += 25;
  const oreg = (obj.region || "").toLowerCase();
  if (Array.isArray(brief.regions) && brief.regions.some((rk) => {
    const words = regionName(brief._lang || "de", rk).toLowerCase().split(/[^a-zàâäéèêëîïôöùûüç]+/).filter((w) => w.length > 2);
    return words.some((w) => oreg.includes(w));
  })) score += 25;
  return Math.round((score / max) * 100);
}

// ---------------- scroll reveal ----------------
function useReveal(dep) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const els = Array.from(document.querySelectorAll(".reveal:not(.in)"));
    if (!els.length) return;
    if (typeof IntersectionObserver === "undefined") { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [dep]);
}

// ---------------- hallmark / crest ----------------
function Crest({ className = "", tone = "gold" }) {
  const raw = useId().replace(/[:]/g, "");
  const gid = "cg" + raw;
  const paint = tone === "gold" ? `url(#${gid})` : "currentColor";
  return (
    <svg className={`crest ${className}`} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#946f30" />
          <stop offset="0.42" stopColor="#eed59c" />
          <stop offset="0.68" stopColor="#c9a14a" />
          <stop offset="1" stopColor="#f4e1ad" />
        </linearGradient>
      </defs>
      <path d="M24 1.5 L46.5 24 L24 46.5 L1.5 24 Z" fill="none" stroke={paint} strokeWidth="1" />
      <path d="M24 8 L40 24 L24 40 L8 24 Z" fill="none" stroke={paint} strokeWidth="0.75" opacity="0.5" />
      <path d="M24 15 L32 29.5 L16 29.5 Z" fill={paint} />
      <path d="M24 20.4 L27.6 27 L20.4 27 Z" fill="#0a0b0d" />
      <circle cx="24" cy="33.4" r="1.5" fill={paint} />
    </svg>
  );
}

// ---------------- styles ----------------
const css = `
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --noir:#0a0b0d; --paper:#0b0c0f; --paper2:#101218; --card:#13151b; --card2:#171a21;
  --ink:#f4f1ea; --ink2:#d3cec3; --line:#23262e; --line2:#31353e; --mute:#7d818a; --mute2:#a8abb4;
  --gold:#c9a14a; --gold2:#e8cd8a; --gold3:#9c7733; --gold-soft:rgba(201,161,74,.14);
  --grad-gold:linear-gradient(105deg,#9c7733 0%,#eed59c 40%,#c9a14a 62%,#f4e1ad 100%);
  --grad-metal:linear-gradient(135deg,#8d6c2f,#ecd49a 48%,#c9a14a 72%,#f4e1ad);
  --ease:cubic-bezier(.22,.61,.36,1);
  --serif:'Cormorant Garamond',Georgia,serif;
  --sans:'Inter','Helvetica Neue',Arial,sans-serif;
}
html{scroll-behavior:smooth;scrollbar-color:var(--line2) var(--paper)}
.lr{background:var(--paper);color:var(--ink);font-family:var(--sans);min-height:100vh;position:relative;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;line-height:1.5;overflow-x:hidden}
.lr ::selection{background:rgba(201,161,74,.26);color:#fff}
.lr ::-webkit-scrollbar{width:11px;height:11px}
.lr ::-webkit-scrollbar-track{background:var(--paper)}
.lr ::-webkit-scrollbar-thumb{background:var(--line2);border:3px solid var(--paper);border-radius:20px}
.lr ::-webkit-scrollbar-thumb:hover{background:var(--gold3)}
.wrap{max-width:1140px;margin:0 auto;padding:0 34px;position:relative}
@media(max-width:640px){.wrap{padding:0 20px}}

/* atmosphere */
.grain{position:fixed;inset:0;z-index:3;pointer-events:none;opacity:.04;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.vignette{position:fixed;inset:0;z-index:2;pointer-events:none;
  background:radial-gradient(130% 90% at 50% -10%,transparent 55%,rgba(0,0,0,.55) 100%)}
.crest{display:block}
.gold-text{background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent;color:transparent}
.num{font-variant-numeric:tabular-nums lining-nums;font-feature-settings:"tnum" 1}

/* reveal */
.reveal{opacity:0;transform:translateY(24px);
  transition:opacity 1s var(--ease),transform 1s var(--ease);transition-delay:var(--d,0s);will-change:opacity,transform}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .reveal{opacity:1;transform:none;transition:none}
  *{animation:none!important}
}

/* nav */
.nav{position:sticky;top:0;z-index:50;background:rgba(11,12,15,.78);
  backdrop-filter:blur(14px) saturate(120%);-webkit-backdrop-filter:blur(14px) saturate(120%);
  border-bottom:1px solid var(--line)}
.nav:after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;
  background:linear-gradient(90deg,transparent,var(--gold-soft) 22%,rgba(201,161,74,.5) 50%,var(--gold-soft) 78%,transparent)}
.nav-in{display:flex;align-items:center;justify-content:space-between;height:80px;
  max-width:1140px;margin:0 auto;padding:0 34px}
@media(max-width:640px){.nav-in{padding:0 20px;height:66px}}
.brand-wrap{display:flex;align-items:center;gap:15px;cursor:pointer}
.brand-crest{width:30px;height:30px;flex:none;transition:transform .6s var(--ease)}
.brand-wrap:hover .brand-crest{transform:rotate(90deg)}
.brand{font-family:var(--serif);font-weight:600;line-height:1}
.brand.bt{letter-spacing:.22em;font-size:23px;padding-left:.22em}
@media(max-width:520px){.brand.bt{font-size:17px;letter-spacing:.14em}.brand-crest{width:24px;height:24px}}
.brand small{display:block;font-family:var(--sans);font-size:8.5px;
  text-transform:uppercase;color:var(--gold);margin-top:5px;font-weight:600;letter-spacing:.3em}
@media(max-width:520px){.brand small{font-size:7.5px;letter-spacing:.22em}}
.nav-r{display:flex;align-items:center;gap:4px}
.nlink{position:relative;background:none;border:none;color:var(--mute2);font-family:var(--sans);font-size:11.5px;
  letter-spacing:.17em;text-transform:uppercase;cursor:pointer;padding:9px 14px;transition:color .3s var(--ease)}
.nlink:after{content:"";position:absolute;left:14px;right:14px;bottom:3px;height:1px;background:var(--grad-gold);
  transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease)}
.nlink:hover,.nlink.on{color:var(--ink)}
.nlink:hover:after,.nlink.on:after{transform:scaleX(1)}
@media(max-width:760px){.nlink{display:none}}
.lang{display:flex;gap:1px;margin-left:12px;border:1px solid var(--line2);border-radius:2px;overflow:hidden}
.lang button{background:none;border:none;color:var(--mute);font-size:10.5px;letter-spacing:.1em;
  cursor:pointer;padding:6px 9px;text-transform:uppercase;transition:all .25s var(--ease)}
.lang button:hover{color:var(--ink2)}
.lang button.on{background:var(--grad-metal);color:#0a0b0d;font-weight:600}

/* hero */
.hero{padding:120px 0 70px;position:relative;overflow:hidden}
.hero:before{content:"";position:absolute;top:-200px;left:24%;width:820px;height:560px;z-index:0;
  background:radial-gradient(closest-side,rgba(201,161,74,.18),transparent 72%);pointer-events:none;filter:blur(10px)}
@media(max-width:640px){.hero{padding:70px 0 44px}}
.hero-crest{position:absolute;top:46px;right:-46px;width:min(460px,54vw);height:auto;
  color:var(--gold);opacity:.06;pointer-events:none;z-index:0}
@media(max-width:760px){.hero-crest{right:-110px;top:90px;opacity:.045}}
.hero-in{position:relative;z-index:1}
.eyebrow{font-size:10.5px;letter-spacing:.4em;text-transform:uppercase;color:var(--gold);
  margin-bottom:34px;display:flex;align-items:center;gap:15px}
.eyebrow:before{content:"";width:46px;height:1px;background:var(--grad-gold)}
.hero h1{font-family:var(--serif);font-weight:500;font-size:clamp(48px,8.6vw,104px);
  line-height:.97;letter-spacing:-.01em;text-wrap:balance}
.hero h1 em{font-style:italic}
.hero .sub{max-width:600px;margin:34px 0 40px;color:var(--mute2);font-size:clamp(15px,2vw,18.5px);line-height:1.75}
.hero .note{font-size:12px;color:var(--mute);margin-top:26px;letter-spacing:.03em}
.marks{display:flex;align-items:center;gap:18px;margin-top:46px;flex-wrap:wrap}
.marks span{font-size:10.5px;letter-spacing:.28em;text-transform:uppercase;color:var(--mute2)}
.marks i{width:5px;height:5px;background:var(--gold);transform:rotate(45deg);opacity:.85}

/* buttons */
.cta{display:inline-flex;align-items:center;gap:12px;background:var(--ink);color:var(--noir);
  border:none;font-family:var(--sans);font-size:12px;letter-spacing:.2em;text-transform:uppercase;
  font-weight:600;padding:18px 32px;border-radius:2px;cursor:pointer;position:relative;overflow:hidden;isolation:isolate;
  transition:color .35s var(--ease),box-shadow .45s var(--ease),transform .35s var(--ease)}
.cta:before{content:"";position:absolute;inset:0;background:var(--grad-metal);opacity:0;
  transition:opacity .4s var(--ease);z-index:0}
.cta>*{position:relative;z-index:1}
.cta:hover{transform:translateY(-2px);box-shadow:0 18px 40px -16px rgba(201,161,74,.55)}
.cta:hover:before{opacity:1}
.cta .ar{display:inline-block;transition:transform .4s var(--ease)}
.cta:hover .ar{transform:translateX(6px)}
.cta.ghost{background:none;color:var(--ink);border:1px solid var(--line2)}
.cta.ghost:hover{color:var(--noir);border-color:transparent}

/* signature: dossier ledger */
.ledger{margin-top:64px;border-top:1px solid var(--ink)}
.ledger-row{display:grid;grid-template-columns:60px 1fr;gap:24px;padding:24px 14px 24px 0;
  border-bottom:1px solid var(--line);align-items:baseline;transition:border-color .4s var(--ease),padding-left .4s var(--ease)}
.ledger-row:hover{border-color:var(--line2);padding-left:10px}
.ledger-row .rn{font-family:var(--serif);font-style:italic;font-size:20px;
  transition:transform .4s var(--ease);background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
.ledger-row:hover .rn{transform:translateX(3px)}
.ledger-row .rt{font-family:var(--serif);font-size:clamp(20px,2.6vw,27px);font-weight:500;transition:color .35s var(--ease)}
.ledger-row:hover .rt{color:var(--gold2)}
.ledger-row .rd{font-size:13.5px;color:var(--mute2);margin-top:6px;max-width:580px;line-height:1.65}

/* sections */
.sec{padding:104px 0;border-top:1px solid var(--line)}
@media(max-width:640px){.sec{padding:64px 0}}
.sec-tag{font-size:10.5px;letter-spacing:.34em;text-transform:uppercase;color:var(--gold);
  margin-bottom:20px;display:flex;align-items:center;gap:12px}
.sec-tag:before{content:"";width:6px;height:6px;background:var(--gold);transform:rotate(45deg);flex:none}
.sec-h{font-family:var(--serif);font-size:clamp(32px,5vw,54px);font-weight:500;letter-spacing:-.01em;
  margin-bottom:16px;text-wrap:balance}

/* discretion */
.pullquote{position:relative;max-width:760px;margin-top:30px;padding-left:34px}
.pullquote:before{content:"";position:absolute;left:0;top:6px;bottom:6px;width:1px;
  background:linear-gradient(180deg,var(--gold),transparent)}
.disc-body{font-size:clamp(17px,2.2vw,22px);line-height:1.78;color:var(--ink2);font-family:var(--serif)}
.disc-sign{margin-top:30px;display:flex;align-items:center;gap:14px;color:var(--mute);
  font-size:11px;letter-spacing:.26em;text-transform:uppercase}
.disc-sign .crest{width:22px;height:22px}

/* form */
.formwrap{max-width:780px;margin:0 auto}
.prog{display:flex;align-items:center;gap:0;margin-bottom:46px}
.prog .seg{flex:1;height:1.5px;background:var(--line);position:relative;overflow:hidden}
.prog .seg:after{content:"";position:absolute;inset:0;background:var(--grad-gold);transform:scaleX(0);
  transform-origin:left;transition:transform .6s var(--ease)}
.prog .seg.on:after{transform:scaleX(1)}
.prog .lab{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--mute);
  margin:0 14px;white-space:nowrap;transition:color .3s var(--ease)}
.prog .lab.on{color:var(--ink)}
@media(max-width:640px){.prog .lab{display:none}.prog .lab.on{display:inline}}
.step-head{font-family:var(--serif);font-size:clamp(30px,4.4vw,42px);font-weight:500;margin-bottom:8px;letter-spacing:-.01em}
.step-meta{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:34px}
.field{margin-bottom:24px}
.field label{display:block;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--mute2);margin-bottom:10px}
.field input,.field select,.field textarea{width:100%;background:var(--card);border:1px solid var(--line);
  color:var(--ink);font-family:var(--sans);font-size:15px;padding:14px 15px;border-radius:2px;
  transition:border-color .3s var(--ease),box-shadow .3s var(--ease),background .3s var(--ease)}
.field input::placeholder,.field textarea::placeholder{color:var(--mute);opacity:.7}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--gold);
  background:var(--card2);box-shadow:0 0 0 3px rgba(201,161,74,.1)}
.field select{appearance:none;-webkit-appearance:none;-moz-appearance:none;cursor:pointer;padding-right:42px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23c9a14a' stroke-width='1.4'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 15px center}
.field textarea{resize:vertical;min-height:140px;line-height:1.65}
.field input[type=number]{-moz-appearance:textfield}
.field input[type=number]::-webkit-outer-spin-button,.field input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.field.err input,.field.err select,.field.err textarea{border-color:var(--gold)}
.err-msg{color:var(--gold2);font-size:11px;margin-top:8px;letter-spacing:.04em}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
@media(max-width:600px){.grid2,.grid3{grid-template-columns:1fr}}
.range{display:flex;align-items:center;gap:14px}
.range .rl{font-size:11px;color:var(--mute);text-transform:uppercase;letter-spacing:.1em;flex:none}
.chips{display:flex;flex-wrap:wrap;gap:10px}
.chip{background:var(--card);border:1px solid var(--line);color:var(--ink2);font-family:var(--sans);
  font-size:13px;padding:10px 17px;border-radius:2px;cursor:pointer;letter-spacing:.01em;
  transition:border-color .25s var(--ease),color .25s var(--ease),background .25s var(--ease),transform .2s var(--ease)}
.chip:hover{border-color:var(--gold);color:var(--ink);transform:translateY(-1px)}
.chip.on{background:var(--grad-metal);color:var(--noir);border-color:transparent;font-weight:600}
.formnav{display:flex;justify-content:space-between;align-items:center;margin-top:40px;gap:14px}
.linkbtn{background:none;border:none;color:var(--mute2);font-size:12px;letter-spacing:.15em;
  text-transform:uppercase;cursor:pointer;padding:10px 4px;transition:color .3s var(--ease)}
.linkbtn:hover{color:var(--gold2)}
.sent-box{text-align:center;padding:54px 0}
.sent-box .seal{width:96px;height:96px;margin:0 auto 26px;display:flex;align-items:center;justify-content:center;
  border:1px solid var(--line2);border-radius:50%;position:relative}
.sent-box .seal .crest{width:50px;height:50px}
.sent-box .seal:after{content:"";position:absolute;inset:-9px;border:1px solid var(--gold);border-radius:50%;opacity:.22}
.sent-box h3{font-family:var(--serif);font-size:38px;font-weight:500;margin-bottom:12px;letter-spacing:-.01em}
.sent-box p{color:var(--mute2);margin-bottom:34px;max-width:460px;margin-left:auto;margin-right:auto;line-height:1.7}

/* office (crm) */
.gate{max-width:440px;margin:84px auto;background:linear-gradient(180deg,var(--card2),var(--card));
  border:1px solid var(--line2);padding:52px 48px;border-radius:3px;position:relative;overflow:hidden}
.gate:before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:var(--grad-gold);opacity:.6}
.gate .gate-crest{width:46px;height:46px;margin-bottom:22px}
.gate h2{font-family:var(--serif);font-size:34px;font-weight:500;margin-bottom:8px;letter-spacing:-.01em}
.gate p{color:var(--mute);font-size:13px;margin-bottom:30px;line-height:1.6}
.officebar{display:flex;justify-content:space-between;align-items:center;margin-bottom:34px;
  padding-bottom:22px;border-bottom:1px solid var(--line)}
.officebar .ob-id{display:flex;align-items:center;gap:13px}
.officebar .ob-id .crest{width:26px;height:26px;flex:none}
.officebar .ob-t{font-family:var(--serif);font-size:22px;letter-spacing:.24em}
.tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:34px;border-bottom:1px solid var(--line)}
.tab{background:none;border:none;border-bottom:2px solid transparent;color:var(--mute);
  font-family:var(--sans);font-size:11.5px;letter-spacing:.15em;text-transform:uppercase;
  cursor:pointer;padding:13px 17px;margin-bottom:-1px;transition:color .3s var(--ease),border-color .3s var(--ease)}
.tab:hover{color:var(--ink2)}
.tab.on{color:var(--ink);border-color:var(--gold)}
.tab .badge{display:inline-block;background:var(--grad-metal);color:var(--noir);font-size:9.5px;
  border-radius:9px;padding:1px 7px;margin-left:7px;font-weight:700;vertical-align:middle}
.card{background:var(--card);border:1px solid var(--line);padding:26px;margin-bottom:18px;border-radius:3px;
  transition:border-color .35s var(--ease),transform .35s var(--ease)}
.card:hover{border-color:var(--line2)}
.card-h{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:14px}
.card-h .t{font-family:var(--serif);font-size:24px;font-weight:500;letter-spacing:-.01em}
.pill{font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);
  border:1px solid var(--gold);padding:4px 10px;white-space:nowrap;border-radius:2px}
.pill.mute{color:var(--mute);border-color:var(--line2)}
.kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px 24px;margin:12px 0}
.kv .k{font-size:9.5px;letter-spacing:.15em;text-transform:uppercase;color:var(--mute);margin-bottom:4px}
.kv .v{font-size:14.5px;font-variant-numeric:tabular-nums}
.tags{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0}
.tg{font-size:11px;background:var(--paper2);border:1px solid var(--line);padding:4px 10px;letter-spacing:.04em;border-radius:2px}
.card p.desc{color:var(--mute2);font-size:14px;line-height:1.65;margin-top:10px}
.btn{background:var(--ink);color:var(--noir);border:none;font-family:var(--sans);font-size:11.5px;
  letter-spacing:.13em;text-transform:uppercase;font-weight:600;padding:13px 22px;border-radius:2px;cursor:pointer;position:relative;overflow:hidden;isolation:isolate;
  transition:color .35s var(--ease),box-shadow .4s var(--ease),transform .3s var(--ease)}
.btn:before{content:"";position:absolute;inset:0;background:var(--grad-metal);opacity:0;transition:opacity .35s var(--ease)}
.btn>*{position:relative;z-index:1}
.btn:hover{transform:translateY(-1px);box-shadow:0 14px 30px -16px rgba(201,161,74,.5)}
.btn:hover:before{opacity:1}
.btn.sec{background:none;color:var(--ink);border:1px solid var(--line2)}
.btn.sec:before{display:none}
.btn.sec:hover{border-color:var(--gold);color:var(--gold2);box-shadow:none}
.btn:disabled{opacity:.4;cursor:default;transform:none;box-shadow:none}
.btn:disabled:before{opacity:0}
.btnrow{display:flex;gap:11px;flex-wrap:wrap;margin-top:18px}
.agent-note{color:var(--mute2);font-size:14px;line-height:1.65;margin-bottom:24px;max-width:660px}
.match-line{display:flex;align-items:center;gap:16px;padding:15px 0;border-top:1px solid var(--line)}
.match-line:first-of-type{border-top:none}
.match-line .mt-name{font-family:var(--serif);font-size:18px}
.bar{flex:1;height:3px;background:var(--line);border-radius:3px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--grad-gold);border-radius:3px}
.scn{font-family:var(--serif);font-size:20px;width:54px;text-align:right;font-variant-numeric:tabular-nums;
  background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
.teaser{background:var(--paper);border:1px dashed var(--gold3);padding:18px 20px;margin-top:14px;border-radius:3px}
.teaser .lbl{font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:11px}
.teaser .row{display:flex;justify-content:space-between;padding:4px 0;font-size:14px;font-variant-numeric:tabular-nums}
.teaser .row span:first-child{color:var(--mute)}
.censored{color:var(--mute);font-style:italic}
.mail{background:var(--card);border:1px solid var(--line);padding:24px;margin-bottom:15px;border-radius:3px}
.mail .mh{font-size:12px;color:var(--mute)}
.mail .mh b{color:var(--ink2);font-weight:600}
.mail .mt{font-size:10px;letter-spacing:.16em;text-transform:uppercase;margin-top:7px;color:var(--gold)}
.mail .mb{margin-top:16px;padding-top:16px;border-top:1px solid var(--line);font-size:14px;
  color:var(--ink2);line-height:1.7;white-space:pre-wrap}
.empty{color:var(--mute);font-size:14px;padding:34px 0;text-align:center;font-style:italic}

/* footer */
.foot{border-top:1px solid var(--line);padding:48px 0;position:relative}
.foot:before{content:"";position:absolute;top:-1px;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--gold-soft) 30%,rgba(201,161,74,.4) 50%,var(--gold-soft) 70%,transparent)}
.foot-in{display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;color:var(--mute);
  font-size:11.5px;letter-spacing:.06em;align-items:center}
.foot-id{display:flex;align-items:center;gap:12px}
.foot-id .crest{width:22px;height:22px;flex:none;opacity:.85}
.foot-marks{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.foot-marks span{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--mute)}
.foot-marks i{width:4px;height:4px;background:var(--gold);transform:rotate(45deg);opacity:.7}
.foot .dot{cursor:default;opacity:.45;font-size:16px;transition:opacity .3s var(--ease)}
.foot .dot:hover{opacity:.9}
.full{grid-column:1/-1}
`;

export default function App() {
  const [lang, setLang] = useState("de");
  const [page, setPage] = useState(typeof window !== "undefined" && window.location.hash === "#office" ? "office" : "home");
  const t = T[lang];

  const [objects, setObjects] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const [outbox, setOutbox] = useState([]);

  const go = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="lr">
      <style>{css}</style>
      <div className="vignette" />
      <div className="grain" />

      {page !== "office" && (
        <nav className="nav">
          <div className="nav-in">
            <div className="brand-wrap" onClick={() => go("home")}>
              <Crest className="brand-crest" />
              <div className="brand bt">THE BLACK TIER<small>{t.tagline}</small></div>
            </div>
            <div className="nav-r">
              <button className={`nlink ${page === "home" ? "on" : ""}`} onClick={() => go("home")}>{t.nav_how}</button>
              <button className={`nlink ${page === "disc" ? "on" : ""}`} onClick={() => go("disc")}>{t.nav_disc}</button>
              <button className={`nlink ${page === "request" ? "on" : ""}`} onClick={() => go("request")}>{t.nav_request}</button>
              <div className="lang">
                {["de", "en", "fr"].map((l) => <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>{l}</button>)}
              </div>
            </div>
          </div>
        </nav>
      )}

      {page === "home" && <Home t={t} go={go} />}
      {page === "disc" && <Discretion t={t} go={go} />}
      {page === "request" && <Request t={t} lang={lang} onSubmit={(b) => {
        setBriefs((p) => [{ ...b, id: "b" + Date.now(), released: [], handed: [] }, ...p]);
        if (hasSupabase) {
          supabase.from("inquiries").insert({
            name: b.name, email: b.email, phone: b.phone || null, buyer_type: b.buyerType || null,
            residence: b.residence || null, horizon: b.horizon || null, finance: b.finance || null,
            categories: b.types, regions: b.regions,
            budget_from: Number(b.budgetFrom) || null, budget_to: Number(b.budgetTo) || null,
            features: b.features, rooms_min: Number(b.roomsMin) || null, area_min: Number(b.areaMin) || null, plot_min: Number(b.plotMin) || null,
            detail: b.detail, discretion: b.discretion || null, contact_pref: b.contactPref || null, lang,
          }).then(({ error }) => { if (error) console.error("inquiry insert failed:", error.message); });
        }
      }} />}
      {page === "office" && (hasSupabase
        ? <OfficeBackend t={t} lang={lang} go={go} />
        : (
          <Office t={t} lang={lang} go={go}
            objects={objects} setObjects={setObjects}
            briefs={briefs} setBriefs={setBriefs}
            outbox={outbox} setOutbox={setOutbox} />
        ))}

      {page !== "office" && (
        <footer className="foot">
          <div className="wrap">
            <div className="foot-in">
              <div className="foot-id">
                <Crest />
                <span>© {new Date().getFullYear()} THE BLACK TIER — {t.tagline}</span>
              </div>
              <div className="foot-marks">
                <span>{t.mark_offmarket}</span><i />
                <span>{t.mark_confidential}</span><i />
                <span>{t.heroPlace}</span>
                <span className="dot" onClick={() => go("office")} title="office">·</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function Home({ t, go }) {
  useReveal("home");
  return (
    <>
      <header className="hero">
        <Crest className="hero-crest" tone="line" />
        <div className="wrap hero-in">
          <div className="eyebrow reveal">{t.tagline} — {t.heroPlace}</div>
          <h1 className="reveal" style={{ "--d": ".06s" }}>{t.hero1}<br /><em className="gold-text">{t.hero2}</em></h1>
          <p className="sub reveal" style={{ "--d": ".14s" }}>{t.heroSub}</p>
          <div className="reveal" style={{ "--d": ".2s" }}>
            <button className="cta" onClick={() => go("request")}><span>{t.heroCta}</span> <span className="ar">→</span></button>
          </div>
          <div className="note reveal" style={{ "--d": ".26s" }}>{t.heroNote}</div>
          <div className="marks reveal" style={{ "--d": ".32s" }}>
            <span>{t.mark_offmarket}</span><i />
            <span>{t.mark_confidential}</span><i />
            <span>{t.mark_personal}</span>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="sec-tag reveal">{t.tagline}</div>
          <h2 className="sec-h reveal" style={{ "--d": ".05s" }}>{t.mandateTitle}</h2>
          <div className="ledger">
            {[["i", t.m1t, t.m1d], ["ii", t.m2t, t.m2d], ["iii", t.m3t, t.m3d], ["iv", t.m4t, t.m4d]].map(([n, h, d], i) => (
              <div className="ledger-row reveal" key={n} style={{ "--d": `${i * 0.07}s` }}>
                <span className="rn">{n}.</span>
                <div><div className="rt">{h}</div><div className="rd">{d}</div></div>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ marginTop: 48 }}>
            <button className="cta" onClick={() => go("request")}><span>{t.heroCta}</span> <span className="ar">→</span></button>
          </div>
        </div>
      </section>
    </>
  );
}

function Discretion({ t, go }) {
  useReveal("disc");
  return (
    <section className="sec" style={{ borderTop: "none", paddingTop: 84 }}>
      <div className="wrap">
        <div className="sec-tag reveal">{t.nav_disc}</div>
        <h2 className="sec-h reveal" style={{ "--d": ".05s" }}>{t.discTitle}</h2>
        <div className="pullquote reveal" style={{ "--d": ".12s" }}>
          <p className="disc-body">{t.discBody}</p>
          <div className="disc-sign"><Crest /> THE BLACK TIER</div>
        </div>
        <div className="reveal" style={{ "--d": ".18s", marginTop: 48 }}>
          <button className="cta ghost" onClick={() => go("request")}><span>{t.heroCta}</span> <span className="ar">→</span></button>
        </div>
      </div>
    </section>
  );
}

function Request({ t, lang, onSubmit }) {
  const empty = {
    name: "", email: "", phone: "", buyerType: "", residence: "", horizon: "", finance: "",
    types: [], regions: [], budgetFrom: "", budgetTo: "", features: [], roomsMin: "", areaMin: "", plotMin: "",
    detail: "", discretion: "", contactPref: "",
  };
  const [f, setF] = useState(empty);
  const [step, setStep] = useState(1);
  const [errs, setErrs] = useState({});
  const [done, setDone] = useState(false);
  useReveal("request" + step + done);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const toggle = (k, v) => setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));
  const regOpts = useMemo(() => regionOptions(lang), [lang]);
  const addRegion = (v) => setF((p) => ({ ...p, regions: p.regions.includes(v) ? p.regions : [...p.regions, v] }));

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!f.name.trim()) e.name = 1;
      if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 1;
      if (!f.buyerType) e.buyerType = 1;
    }
    if (step === 2) {
      if (f.types.length === 0) e.types = 1;
      if (f.regions.length === 0) e.regions = 1;
    }
    if (step === 3) {
      if (!f.detail.trim()) e.detail = 1;
    }
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) { setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const back = () => { setErrs({}); setStep((s) => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const submit = () => {
    if (!validateStep()) return;
    onSubmit({ ...f, _t: T[lang], _lang: lang, at: new Date().toISOString() });
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <section className="sec" style={{ borderTop: "none", paddingTop: 84 }}>
        <div className="wrap"><div className="formwrap"><div className="sent-box reveal">
          <div className="seal"><Crest /></div>
          <h3>{t.sent}</h3>
          <p>{t.sentSub}</p>
          <button className="cta ghost" onClick={() => { setF(empty); setStep(1); setDone(false); }}><span>{t.sentAgain}</span></button>
        </div></div></div>
      </section>
    );
  }

  const stepLabels = [t.fs1, t.fs2, t.fs3];

  return (
    <section className="sec" style={{ borderTop: "none", paddingTop: 68 }}>
      <div className="wrap">
        <div className="formwrap">
          <div className="prog">
            {[1, 2, 3].map((n, i) => (
              <React.Fragment key={n}>
                {i > 0 && <div className={`seg ${step >= n ? "on" : ""}`} />}
                <span className={`lab ${step === n ? "on" : ""}`}>{String(n).padStart(2, "0")} · {stepLabels[i]}</span>
              </React.Fragment>
            ))}
          </div>

          <div className="step-meta">{t.step} {step} {t.of} 3</div>

          {step === 1 && (
            <>
              <div className="step-head">{t.fs1}</div>
              <div className="grid2" style={{ marginTop: 28 }}>
                <div className={`field ${errs.name ? "err" : ""}`}><label>{t.fName}</label><input value={f.name} onChange={set("name")} />{errs.name && <div className="err-msg">{t.required}</div>}</div>
                <div className={`field ${errs.email ? "err" : ""}`}><label>{t.fEmail}</label><input type="email" value={f.email} onChange={set("email")} />{errs.email && <div className="err-msg">{t.required}</div>}</div>
              </div>
              <div className="grid2">
                <div className="field"><label>{t.fPhone}</label><input value={f.phone} onChange={set("phone")} /></div>
                <div className="field"><label>{t.fResidence}</label><input value={f.residence} onChange={set("residence")} /></div>
              </div>
              <div className={`field ${errs.buyerType ? "err" : ""}`}>
                <label>{t.fBuyerType}</label>
                <div className="chips">
                  {[["private", t.bt_private], ["family", t.bt_family], ["company", t.bt_company], ["investor", t.bt_investor], ["rep", t.bt_rep]].map(([v, l]) => (
                    <button key={v} type="button" className={`chip ${f.buyerType === v ? "on" : ""}`} onClick={() => setF((p) => ({ ...p, buyerType: v }))}>{l}</button>
                  ))}
                </div>
                {errs.buyerType && <div className="err-msg">{t.chooseOne}</div>}
              </div>
              <div className="grid2">
                <div className="field"><label>{t.fHorizon}</label>
                  <select value={f.horizon} onChange={set("horizon")}>
                    <option value="">—</option>
                    {[["now", t.hz_now], ["6m", t.hz_6m], ["12m", t.hz_12m], ["open", t.hz_open]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="field"><label>{t.fFinance}</label>
                  <select value={f.finance} onChange={set("finance")}>
                    <option value="">—</option>
                    {[["cash", t.fin_cash], ["mortgage", t.fin_mortgage], ["mixed", t.fin_mixed], ["tbd", t.fin_tbd]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="step-head">{t.fs2}</div>
              <div className={`field ${errs.types ? "err" : ""}`} style={{ marginTop: 28 }}>
                <label>{t.fTypes}</label>
                <div className="chips">
                  {TYPE_KEYS.map((k) => <button key={k} type="button" className={`chip ${f.types.includes(k) ? "on" : ""}`} onClick={() => toggle("types", k)}>{typeLabel(t, k)}</button>)}
                </div>
                {errs.types && <div className="err-msg">{t.chooseOne}</div>}
              </div>
              <div className={`field ${errs.regions ? "err" : ""}`}>
                <label>{t.fRegions}</label>
                <select value="" onChange={(e) => { if (e.target.value) addRegion(e.target.value); }}>
                  <option value="">{t.fRegionAdd}</option>
                  <option value="WORLD">{regionName(lang, "WORLD")}</option>
                  {regOpts.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
                </select>
                {f.regions.length > 0 && (
                  <div className="chips" style={{ marginTop: 12 }}>
                    {f.regions.map((code) => (
                      <button key={code} type="button" className="chip on" onClick={() => toggle("regions", code)}>{regionName(lang, code)} ✕</button>
                    ))}
                  </div>
                )}
                {errs.regions && <div className="err-msg">{t.chooseOne}</div>}
              </div>
              <div className="field">
                <label>{t.fBudget}</label>
                <div className="range">
                  <span className="rl">{t.fBudgetFrom}</span>
                  <input type="number" value={f.budgetFrom} onChange={set("budgetFrom")} placeholder="2'000'000" />
                  <span className="rl">{t.fBudgetTo}</span>
                  <input type="number" value={f.budgetTo} onChange={set("budgetTo")} placeholder="8'000'000" />
                </div>
              </div>
              {f.types.some((k) => RE_CATS.includes(k)) && (
                <>
                  <div className="field">
                    <label>{t.fFeatures}</label>
                    <div className="chips">
                      {FEATURE_KEYS.map((k) => <button key={k} type="button" className={`chip ${f.features.includes(k) ? "on" : ""}`} onClick={() => toggle("features", k)}>{featureLabel(t, k)}</button>)}
                    </div>
                  </div>
                  <div className="grid3">
                    <div className="field"><label>{t.fRoomsMin}</label><input type="number" value={f.roomsMin} onChange={set("roomsMin")} /></div>
                    <div className="field"><label>{t.fAreaMin}</label><input type="number" value={f.areaMin} onChange={set("areaMin")} /></div>
                    <div className="field"><label>{t.fPlotMin}</label><input type="number" value={f.plotMin} onChange={set("plotMin")} /></div>
                  </div>
                </>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div className="step-head">{t.fs3}</div>
              <div className={`field ${errs.detail ? "err" : ""}`} style={{ marginTop: 28 }}>
                <label>{t.fDetail}</label>
                <textarea value={f.detail} onChange={set("detail")} placeholder={t.fDetailPh} />
                {errs.detail && <div className="err-msg">{t.required}</div>}
              </div>
              <div className="grid2">
                <div className="field"><label>{t.fDiscretion}</label>
                  <select value={f.discretion} onChange={set("discretion")}>
                    <option value="">—</option>
                    {[["normal", t.dsc_normal], ["high", t.dsc_high], ["max", t.dsc_max]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="field"><label>{t.fContactPref}</label>
                  <select value={f.contactPref} onChange={set("contactPref")}>
                    <option value="">—</option>
                    {[["email", t.cp_email], ["phone", t.cp_phone]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="formnav">
            {step > 1 ? <button className="linkbtn" onClick={back}>← {t.back}</button> : <span />}
            {step < 3
              ? <button className="cta" onClick={next}><span>{t.next}</span> <span className="ar">→</span></button>
              : <button className="cta" onClick={submit}><span>{t.submit}</span> <span className="ar">→</span></button>}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------- Office (hidden CRM) ----------------
function Office({ t, lang, go, objects, setObjects, briefs, setBriefs, outbox, setOutbox }) {
  const [ok, setOk] = useState(false);
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);
  const [tab, setTab] = useState("objects");

  if (!ok) {
    return (
      <div className="wrap">
        <div className="gate">
          <Crest className="gate-crest" />
          <h2>{t.crmTitle}</h2>
          <p>{t.crmSub}</p>
          <div className="field">
            <label>{t.crmPass}</label>
            <input type="password" value={code}
              onChange={(e) => { setCode(e.target.value); setWrong(false); }}
              onKeyDown={(e) => e.key === "Enter" && (code === "4321" ? setOk(true) : setWrong(true))} />
            {wrong && <div className="err-msg">{t.crmWrong}</div>}
          </div>
          <button className="cta" style={{ width: "100%", justifyContent: "center" }}
            onClick={() => (code === "4321" ? setOk(true) : setWrong(true))}><span>{t.crmEnter}</span></button>
          <p style={{ marginTop: 20, marginBottom: 0, fontSize: 11 }}>{t.crmHint}</p>
          <button className="linkbtn" style={{ marginTop: 16 }} onClick={() => { window.location.hash = ""; go("home"); }}>← THE BLACK TIER</button>
        </div>
      </div>
    );
  }

  return (
    <section className="sec" style={{ borderTop: "none", paddingTop: 48 }}>
      <div className="wrap">
        <div className="officebar">
          <div className="ob-id">
            <Crest />
            <div className="ob-t">THE BLACK TIER · {t.crmTitle}</div>
          </div>
          <button className="linkbtn" onClick={() => { setOk(false); window.location.hash = ""; go("home"); }}>{t.crmExit} →</button>
        </div>
        <div className="tabs">
          <button className={`tab ${tab === "objects" ? "on" : ""}`} onClick={() => setTab("objects")}>{t.tabObjects}<span className="badge">{objects.length}</span></button>
          <button className={`tab ${tab === "briefs" ? "on" : ""}`} onClick={() => setTab("briefs")}>{t.tabBriefs}<span className="badge">{briefs.length}</span></button>
          <button className={`tab ${tab === "agent" ? "on" : ""}`} onClick={() => setTab("agent")}>{t.tabAgent}</button>
          <button className={`tab ${tab === "outbox" ? "on" : ""}`} onClick={() => setTab("outbox")}>{t.tabOutbox}<span className="badge">{outbox.length}</span></button>
        </div>

        {tab === "objects" && <Objects t={t} objects={objects} setObjects={setObjects} />}
        {tab === "briefs" && <Briefs t={t} lang={lang} briefs={briefs} />}
        {tab === "agent" && <Agent t={t} objects={objects} briefs={briefs} setBriefs={setBriefs} setOutbox={setOutbox} />}
        {tab === "outbox" && <Outbox t={t} outbox={outbox} />}
      </div>
    </section>
  );
}

function Objects({ t, objects, setObjects }) {
  const empty = { title: "", type: "realLux", region: "", address: "", price: "", rooms: "", area: "", plot: "", broker: "", brokerEmail: "", desc: "" };
  const [f, setF] = useState(empty);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const add = () => {
    if (!f.title.trim() || !f.region.trim()) return;
    setObjects((p) => [{ ...f, id: "o" + Date.now(), price: +f.price || 0, rooms: +f.rooms || 0, area: +f.area || 0, plot: +f.plot || 0 }, ...p]);
    setF(empty);
  };
  return (
    <>
      <div className="card">
        <div className="card-h"><div className="t">{t.addObject}</div></div>
        <div className="grid2">
          <div className="field"><label>{t.oTitle}</label><input value={f.title} onChange={set("title")} /></div>
          <div className="field"><label>{t.oType}</label>
            <select value={f.type} onChange={set("type")}>{TYPE_KEYS.map((k) => <option key={k} value={k}>{typeLabel(t, k)}</option>)}</select></div>
        </div>
        <div className="grid2">
          <div className="field"><label>{t.oRegion}</label><input value={f.region} onChange={set("region")} placeholder="z.B. Monaco · London · Dubai" /></div>
          <div className="field"><label>{t.oAddress}</label><input value={f.address} onChange={set("address")} /></div>
        </div>
        <div className="grid3">
          <div className="field"><label>{t.oPrice}</label><input type="number" value={f.price} onChange={set("price")} /></div>
          <div className="field"><label>{t.oRooms}</label><input type="number" value={f.rooms} onChange={set("rooms")} /></div>
          <div className="field"><label>{t.oArea}</label><input type="number" value={f.area} onChange={set("area")} /></div>
        </div>
        <div className="grid3">
          <div className="field"><label>{t.oPlot}</label><input type="number" value={f.plot} onChange={set("plot")} /></div>
          <div className="field"><label>{t.oBroker}</label><input value={f.broker} onChange={set("broker")} /></div>
          <div className="field"><label>{t.oBrokerEmail}</label><input value={f.brokerEmail} onChange={set("brokerEmail")} /></div>
        </div>
        <div className="field"><label>{t.oDesc}</label><textarea value={f.desc} onChange={set("desc")} /></div>
        <button className="btn" onClick={add}><span>{t.save}</span></button>
      </div>

      {objects.length === 0 && <div className="empty">{t.noObjects}</div>}
      {objects.map((o) => (
        <div className="card" key={o.id}>
          <div className="card-h"><div className="t">{o.title}</div><span className="pill">{typeLabel(t, o.type)}</span></div>
          <div className="kv">
            <div><div className="k">{t.oRegion}</div><div className="v">{o.region}</div></div>
            <div><div className="k">{t.oAddress}</div><div className="v">{o.address || "—"}</div></div>
            <div><div className="k">{t.oPrice}</div><div className="v">{fmtCHF(o.price)}</div></div>
            <div><div className="k">{t.oRooms}</div><div className="v">{o.rooms || "—"}</div></div>
            <div><div className="k">{t.oArea}</div><div className="v">{o.area ? o.area + " m²" : "—"}</div></div>
            <div><div className="k">{t.oPlot}</div><div className="v">{o.plot ? o.plot + " m²" : "—"}</div></div>
            <div><div className="k">{t.oBroker}</div><div className="v">{o.broker || "—"}</div></div>
          </div>
          {o.desc && <p className="desc">{o.desc}</p>}
        </div>
      ))}
    </>
  );
}

function Briefs({ t, lang, briefs }) {
  if (briefs.length === 0) return <div className="empty">{t.noBriefs}</div>;
  return briefs.map((b) => (
    <div className="card" key={b.id}>
      <div className="card-h"><div className="t">{b.name}</div><span className="pill mute">{t["bt_" + b.buyerType] || "—"}</span></div>
      <div className="kv">
        <div><div className="k">{t.fEmail}</div><div className="v">{b.email}</div></div>
        <div><div className="k">{t.fPhone}</div><div className="v">{b.phone || "—"}</div></div>
        <div><div className="k">{t.fResidence}</div><div className="v">{b.residence || "—"}</div></div>
        <div><div className="k">{t.fHorizon}</div><div className="v">{t["hz_" + b.horizon] || "—"}</div></div>
        <div><div className="k">{t.fFinance}</div><div className="v">{t["fin_" + b.finance] || "—"}</div></div>
        <div><div className="k">Budget</div><div className="v">{fmtCHF(b.budgetFrom)} – {fmtCHF(b.budgetTo)}</div></div>
        <div><div className="k">{t.fRoomsMin}</div><div className="v">{b.roomsMin || "—"}</div></div>
        <div><div className="k">{t.fDiscretion}</div><div className="v">{t["dsc_" + b.discretion] || "—"}</div></div>
      </div>
      {b.types?.length > 0 && <div className="tags">{b.types.map((k) => <span className="tg" key={k}>{typeLabel(t, k)}</span>)}</div>}
      {b.regions?.length > 0 && <div className="tags">{b.regions.map((k) => <span className="tg" key={k}>{regionName(lang, k)}</span>)}</div>}
      {b.features?.length > 0 && <div className="tags">{b.features.map((k) => <span className="tg" key={k}>{featureLabel(t, k)}</span>)}</div>}
      {b.detail && <p className="desc">{b.detail}</p>}
    </div>
  ));
}

function Agent({ t, objects, briefs, setBriefs, setOutbox }) {
  const [ran, setRan] = useState(0);
  const results = useMemo(() => briefs.map((b) => ({
    brief: b,
    matches: objects.map((o) => ({ obj: o, score: scoreMatch(b, o) })).filter((m) => m.score >= 50).sort((a, z) => z.score - a.score),
  })), [briefs, objects, ran]);

  const sendTeaser = (brief, obj, score) => {
    const body = `${t.confidential}

${typeLabel(t, obj.type)} · ${obj.region}
${t.oPrice}: ${fmtCHF(obj.price)}
${obj.rooms ? `${t.oRooms}: ${obj.rooms}\n` : ""}${obj.area ? `${t.oArea}: ${obj.area} m²\n` : ""}${obj.plot ? `${t.oPlot}: ${obj.plot} m²\n` : ""}${t.censored}

${score}% ${t.score}`;
    setOutbox((p) => [{ id: "m" + Date.now(), kind: "teaser", to: brief.email, subject: `${t.teaserPreview} · ${typeLabel(t, obj.type)}`, body, at: new Date().toISOString() }, ...p]);
    setBriefs((p) => p.map((b) => b.id === brief.id ? { ...b, released: [...b.released, obj.id] } : b));
  };
  const handover = (brief, obj) => {
    const body = `${t.buyer}: ${brief.name} <${brief.email}>${brief.phone ? " · " + brief.phone : ""}
${t.seeks}: ${obj.title} — ${obj.address || obj.region}

${brief.detail}`;
    setOutbox((p) => [{ id: "m" + Date.now() + "h", kind: "handover", to: obj.brokerEmail || obj.broker || "—", subject: `Handover · ${obj.title}`, body, at: new Date().toISOString() }, ...p]);
    setBriefs((p) => p.map((b) => b.id === brief.id ? { ...b, handed: [...b.handed, obj.id] } : b));
  };

  return (
    <>
      <p className="agent-note">{t.agentIntro}</p>
      <button className="btn" style={{ marginBottom: 26 }} onClick={() => setRan((x) => x + 1)}><span>{t.runAgent} ↻</span></button>
      {briefs.length === 0 && <div className="empty">{t.noBriefs}</div>}
      {results.map(({ brief, matches }) => (
        <div className="card" key={brief.id}>
          <div className="card-h"><div className="t">{brief.name}</div>
            <span className={`pill ${matches.length ? "" : "mute"}`}>{matches.length ? `${matches.length} ${t.match}` : t.noMatch}</span></div>
          <p className="desc" style={{ marginBottom: matches.length ? 18 : 0 }}>{brief.detail}</p>
          {matches.map(({ obj, score }) => {
            const released = brief.released.includes(obj.id);
            const handed = brief.handed.includes(obj.id);
            return (
              <div key={obj.id}>
                <div className="match-line">
                  <span className="mt-name">{obj.title}</span>
                  <div className="bar"><i style={{ width: score + "%" }} /></div>
                  <span className="scn">{score}%</span>
                </div>
                <div className="teaser">
                  <div className="lbl">{t.teaserPreview}</div>
                  <div className="row"><span>{t.oType}</span><span>{typeLabel(t, obj.type)}</span></div>
                  <div className="row"><span>{t.oRegion}</span><span>{obj.region}</span></div>
                  <div className="row"><span>{t.oPrice}</span><span>{fmtCHF(obj.price)}</span></div>
                  <div className="row"><span>{t.oAddress}</span><span className="censored">{t.censored}</span></div>
                </div>
                <div className="btnrow">
                  <button className="btn" disabled={released} onClick={() => sendTeaser(brief, obj, score)}><span>{released ? `✓ ${t.released}` : t.releaseTeaser}</span></button>
                  <button className="btn sec" disabled={handed} onClick={() => handover(brief, obj)}>{handed ? `✓ ${t.handedOver}` : t.handover}</button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}

function Outbox({ t, outbox }) {
  if (outbox.length === 0) return <div className="empty">{t.outboxEmpty}</div>;
  return outbox.map((m) => (
    <div className="mail" key={m.id}>
      <div className="mh"><b>{t.to}:</b> {m.to}</div>
      <div className="mh"><b>{t.subject}:</b> {m.subject}</div>
      <div className="mt">
        {m.kind === "handover" ? "↪ " + t.handover : "✦ " + t.releaseTeaser}</div>
      <div className="mb">{m.body}</div>
    </div>
  ));
}

// ================= Real CRM (Supabase-backed) =================
// Internal staff tool — German UI. Rendered only when env vars are set.
function OfficeBackend({ t, lang, go }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setReady(true); } });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  if (!ready) return <div className="wrap"><div className="empty">…</div></div>;
  if (!session) return <StaffLogin go={go} />;
  return <Crm t={t} lang={lang} go={go} session={session} />;
}

function StaffLogin({ go }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
    setBusy(false);
    if (error) setErr("Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.");
  };

  return (
    <div className="wrap">
      <div className="gate">
        <Crest className="gate-crest" />
        <h2>Office</h2>
        <p>Zugang ausschliesslich für Office-Mitarbeiter.</p>
        <div className="field">
          <label>E-Mail</label>
          <input type="email" value={email} autoComplete="username"
            onChange={(e) => { setEmail(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && document.getElementById("crm-pw")?.focus()} />
        </div>
        <div className="field">
          <label>Passwort</label>
          <input id="crm-pw" type="password" value={pw} autoComplete="current-password"
            onChange={(e) => { setPw(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
          {err && <div className="err-msg">{err}</div>}
        </div>
        <button className="cta" style={{ width: "100%", justifyContent: "center" }} disabled={busy}
          onClick={submit}><span>{busy ? "Anmelden …" : "Anmelden"}</span></button>
        <button className="linkbtn" style={{ marginTop: 16 }} onClick={() => { window.location.hash = ""; go("home"); }}>← THE BLACK TIER</button>
      </div>
    </div>
  );
}

function Crm({ t, lang, go, session }) {
  const [tab, setTab] = useState("inquiries");
  const [inquiries, setInquiries] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inqFilter, setInqFilter] = useState("all");
  const [conFilter, setConFilter] = useState("all");

  const load = async () => {
    const [iq, hd, ct, ms] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("holdings").select("*").order("created_at", { ascending: false }),
      supabase.from("contacts").select("*").order("created_at", { ascending: false }),
      supabase.from("messages").select("*").order("created_at", { ascending: false }),
    ]);
    setInquiries(iq.data || []); setHoldings(hd.data || []);
    setContacts(ct.data || []); setMessages(ms.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const sendEmail = async ({ to, subject, body, inquiryId, kind }) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${s?.access_token || ""}` },
      body: JSON.stringify({ to, subject, body, inquiryId, kind }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || `Fehler ${res.status}`);
    }
    await load();
  };

  const addHolding = async (h) => { await supabase.from("holdings").insert(h); await load(); };
  const addContact = async (c) => { await supabase.from("contacts").insert(c); await load(); };
  const saveContact = async (inq) => {
    const dup = contacts.some((c) => c.email && inq.email && c.email.toLowerCase() === inq.email.toLowerCase());
    if (dup) return "exists";
    const { error } = await supabase.from("contacts").insert({
      name: inq.name, email: inq.email, phone: inq.phone || null,
      kind: t["bt_" + inq.buyer_type] || "Käufer",
      categories: inq.categories || [], notes: inq.detail || null,
    });
    if (error) throw new Error(error.message);
    await load();
    return "ok";
  };

  const contactEmails = new Set(contacts.filter((c) => c.email).map((c) => c.email.toLowerCase()));
  const shownInq = inqFilter === "all" ? inquiries : inquiries.filter((i) => (i.categories || []).includes(inqFilter));
  const shownCon = conFilter === "all" ? contacts : contacts.filter((c) => (c.categories || []).includes(conFilter));

  return (
    <section className="sec" style={{ borderTop: "none", paddingTop: 48 }}>
      <div className="wrap">
        <div className="officebar">
          <div className="ob-id">
            <Crest />
            <div className="ob-t">THE BLACK TIER · Office</div>
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--mute)" }}>{session.user?.email}</span>
            <button className="linkbtn" onClick={load}>Aktualisieren ↻</button>
            <button className="linkbtn" onClick={() => { window.location.hash = ""; go("home"); }}>Zur Website →</button>
            <button className="linkbtn" onClick={() => supabase.auth.signOut()}>Abmelden</button>
          </div>
        </div>
        <div className="tabs">
          <button className={`tab ${tab === "inquiries" ? "on" : ""}`} onClick={() => setTab("inquiries")}>Anfragen<span className="badge">{inquiries.length}</span></button>
          <button className={`tab ${tab === "holdings" ? "on" : ""}`} onClick={() => setTab("holdings")}>Bestand<span className="badge">{holdings.length}</span></button>
          <button className={`tab ${tab === "contacts" ? "on" : ""}`} onClick={() => setTab("contacts")}>Kontakte<span className="badge">{contacts.length}</span></button>
          <button className={`tab ${tab === "outbox" ? "on" : ""}`} onClick={() => setTab("outbox")}>Postausgang<span className="badge">{messages.length}</span></button>
        </div>

        {loading && <div className="empty">Lädt …</div>}

        {!loading && tab === "inquiries" && (
          inquiries.length === 0
            ? <div className="empty">Noch keine Anfragen eingegangen.</div>
            : (
              <>
                <Folders items={inquiries} value={inqFilter} onChange={setInqFilter} t={t} />
                {shownInq.map((inq) => (
                  <InquiryCard key={inq.id} inq={inq} holdings={holdings} t={t} lang={lang}
                    onSend={sendEmail} onSaveContact={saveContact}
                    alreadyContact={!!(inq.email && contactEmails.has(inq.email.toLowerCase()))} />
                ))}
              </>
            )
        )}

        {!loading && tab === "holdings" && (
          <>
            <HoldingForm t={t} onAdd={addHolding} />
            {holdings.length === 0 && <div className="empty">Noch keine Objekte erfasst.</div>}
            {holdings.map((o) => (
              <div className="card" key={o.id}>
                <div className="card-h"><div className="t">{o.title}</div><span className="pill">{typeLabel(t, o.category)}</span></div>
                <div className="kv">
                  <div><div className="k">Region</div><div className="v">{o.region || "—"}</div></div>
                  <div><div className="k">Adresse</div><div className="v">{o.address || "—"}</div></div>
                  <div><div className="k">Preis</div><div className="v">{fmtCHF(o.price)}</div></div>
                  <div><div className="k">Makler</div><div className="v">{o.broker || "—"}</div></div>
                </div>
                {o.description && <p className="desc">{o.description}</p>}
              </div>
            ))}
          </>
        )}

        {!loading && tab === "contacts" && (
          <>
            <ContactForm t={t} onAdd={addContact} />
            {contacts.length === 0 && <div className="empty">Noch keine Kontakte.</div>}
            {contacts.length > 0 && <Folders items={contacts} value={conFilter} onChange={setConFilter} t={t} />}
            {shownCon.map((c) => (
              <div className="card" key={c.id}>
                <div className="card-h"><div className="t">{c.name}</div>{c.kind && <span className="pill mute">{c.kind}</span>}</div>
                <div className="kv">
                  <div><div className="k">E-Mail</div><div className="v">{c.email || "—"}</div></div>
                  <div><div className="k">Telefon</div><div className="v">{c.phone || "—"}</div></div>
                </div>
                {c.categories?.length > 0 && <div className="tags">{c.categories.map((k) => <span className="tg" key={k}>{typeLabel(t, k)}</span>)}</div>}
                {c.notes && <p className="desc">{c.notes}</p>}
              </div>
            ))}
          </>
        )}

        {!loading && tab === "outbox" && (
          messages.length === 0
            ? <div className="empty">Noch keine Nachrichten versendet.</div>
            : messages.map((m) => (
              <div className="mail" key={m.id}>
                <div className="mh"><b>An:</b> {m.to_email}</div>
                <div className="mh"><b>Betreff:</b> {m.subject}</div>
                <div className="mt">✦ {new Date(m.created_at).toLocaleString("de-CH")} · {m.created_by || ""}</div>
                <div className="mb">{m.body}</div>
              </div>
            ))
        )}
      </div>
    </section>
  );
}

function InquiryCard({ inq, holdings, t, lang, onSend, onSaveContact, alreadyContact }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("Ihre Anfrage — The Black Tier");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  const briefLike = { types: inq.categories || [], regions: inq.regions || [], budgetFrom: inq.budget_from, budgetTo: inq.budget_to, _lang: inq.lang || lang };
  const matches = (holdings || [])
    .map((h) => ({ h, score: scoreMatch(briefLike, { type: h.category, price: Number(h.price) || 0, region: h.region, rooms: Number(h.rooms) || 0 }) }))
    .filter((m) => m.score >= 50).sort((a, z) => z.score - a.score);

  const fire = async (payload) => {
    if (busy) return;
    setBusy(true); setErr(""); setOk("");
    try { await onSend(payload); setOk("Gesendet ✓"); setOpen(false); setBody(""); }
    catch (e) { setErr("Versand fehlgeschlagen: " + e.message); }
    finally { setBusy(false); }
  };

  const sendDossier = (h, score) => fire({
    to: inq.email, kind: "dossier",
    subject: `Dossier (zensiert) · ${typeLabel(t, h.category)}`,
    body: `Vertraulich\n\n${typeLabel(t, h.category)} · ${h.region || ""}\nPreis: ${fmtCHF(h.price)}\nAdresse & Identität auf Anfrage\n\n${score}% Übereinstimmung`,
    inquiryId: inq.id,
  });

  return (
    <div className="card">
      <div className="card-h">
        <div className="t">{inq.name}</div>
        <span className="pill mute">{new Date(inq.created_at).toLocaleDateString("de-CH")}</span>
      </div>
      <div className="kv">
        <div><div className="k">E-Mail</div><div className="v">{inq.email}</div></div>
        <div><div className="k">Telefon</div><div className="v">{inq.phone || "—"}</div></div>
        <div><div className="k">Wohnsitz</div><div className="v">{inq.residence || "—"}</div></div>
        <div><div className="k">Budget</div><div className="v">{fmtCHF(inq.budget_from)} – {fmtCHF(inq.budget_to)}</div></div>
      </div>
      {inq.categories?.length > 0 && <div className="tags">{inq.categories.map((k) => <span className="tg" key={k}>{typeLabel(t, k)}</span>)}</div>}
      {inq.regions?.length > 0 && <div className="tags">{inq.regions.map((k) => <span className="tg" key={k}>{regionName(lang, k)}</span>)}</div>}
      {inq.detail && <p className="desc">{inq.detail}</p>}

      {matches.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {matches.map(({ h, score }) => (
            <div key={h.id}>
              <div className="match-line">
                <span className="mt-name">{h.title}</span>
                <div className="bar"><i style={{ width: score + "%" }} /></div>
                <span className="scn">{score}%</span>
              </div>
              <div className="btnrow"><button className="btn sec" disabled={busy} onClick={() => sendDossier(h, score)}>Zensiertes Dossier senden</button></div>
            </div>
          ))}
        </div>
      )}

      <div className="btnrow">
        <button className="btn" onClick={() => setOpen((o) => !o)}><span>Per E-Mail antworten</span></button>
        <button className="btn sec" disabled={saved || alreadyContact}
          onClick={async () => { try { await onSaveContact(inq); setSaved(true); } catch (e) { setErr("Kontakt: " + e.message); } }}>
          {saved || alreadyContact ? "✓ Als Kontakt gespeichert" : "Als Kontakt speichern"}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 14 }}>
          <div className="field"><label>Betreff</label><input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="field"><label>Nachricht an {inq.email}</label><textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Ihre Nachricht …" /></div>
          <div className="btnrow">
            <button className="btn" disabled={busy || !body.trim()} onClick={() => fire({ to: inq.email, subject, body, inquiryId: inq.id, kind: "reply" })}>
              <span>{busy ? "Senden …" : "Senden"}</span>
            </button>
          </div>
        </div>
      )}
      {ok && <div className="err-msg" style={{ color: "var(--gold2)" }}>{ok}</div>}
      {err && <div className="err-msg">{err}</div>}
    </div>
  );
}

function HoldingForm({ t, onAdd }) {
  const empty = { title: "", category: "realLux", region: "", address: "", price: "", rooms: "", area: "", plot: "", broker: "", broker_email: "", description: "" };
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const add = async () => {
    if (!f.title.trim() || busy) return;
    setBusy(true);
    await onAdd({
      title: f.title, category: f.category, region: f.region || null, address: f.address || null,
      price: Number(f.price) || null, rooms: Number(f.rooms) || null, area: Number(f.area) || null, plot: Number(f.plot) || null,
      broker: f.broker || null, broker_email: f.broker_email || null, description: f.description || null,
    });
    setF(empty); setBusy(false);
  };
  return (
    <div className="card">
      <div className="card-h"><div className="t">Off-Market-Objekt erfassen</div></div>
      <div className="grid2">
        <div className="field"><label>Interne Bezeichnung</label><input value={f.title} onChange={set("title")} /></div>
        <div className="field"><label>Kategorie</label>
          <select value={f.category} onChange={set("category")}>{TYPE_KEYS.map((k) => <option key={k} value={k}>{typeLabel(t, k)}</option>)}</select></div>
      </div>
      <div className="grid2">
        <div className="field"><label>Region</label><input value={f.region} onChange={set("region")} placeholder="z.B. Monaco · London · Dubai" /></div>
        <div className="field"><label>Adresse (intern, vertraulich)</label><input value={f.address} onChange={set("address")} /></div>
      </div>
      <div className="grid3">
        <div className="field"><label>Preis (CHF)</label><input type="number" value={f.price} onChange={set("price")} /></div>
        <div className="field"><label>Makler (Name)</label><input value={f.broker} onChange={set("broker")} /></div>
        <div className="field"><label>Makler E-Mail</label><input value={f.broker_email} onChange={set("broker_email")} /></div>
      </div>
      <div className="field"><label>Interne Beschreibung</label><textarea value={f.description} onChange={set("description")} /></div>
      <button className="btn" disabled={busy} onClick={add}><span>{busy ? "Speichern …" : "In Bestand speichern"}</span></button>
    </div>
  );
}

function ContactForm({ t, onAdd }) {
  const empty = { name: "", email: "", phone: "", kind: "", notes: "", categories: [] };
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const toggleCat = (k) => setF((p) => ({ ...p, categories: p.categories.includes(k) ? p.categories.filter((x) => x !== k) : [...p.categories, k] }));
  const add = async () => {
    if (!f.name.trim() || busy) return;
    setBusy(true);
    await onAdd({ name: f.name, email: f.email || null, phone: f.phone || null, kind: f.kind || null, categories: f.categories, notes: f.notes || null });
    setF(empty); setBusy(false);
  };
  return (
    <div className="card">
      <div className="card-h"><div className="t">Kontakt hinzufügen</div></div>
      <div className="grid2">
        <div className="field"><label>Name</label><input value={f.name} onChange={set("name")} /></div>
        <div className="field"><label>Art</label><input value={f.kind} onChange={set("kind")} placeholder="Käufer · Verkäufer · Makler …" /></div>
      </div>
      <div className="grid2">
        <div className="field"><label>E-Mail</label><input value={f.email} onChange={set("email")} /></div>
        <div className="field"><label>Telefon</label><input value={f.phone} onChange={set("phone")} /></div>
      </div>
      <div className="field">
        <label>Kategorie (Ordner)</label>
        <div className="chips">
          {TYPE_KEYS.map((k) => <button key={k} type="button" className={`chip ${f.categories.includes(k) ? "on" : ""}`} onClick={() => toggleCat(k)}>{typeLabel(t, k)}</button>)}
        </div>
      </div>
      <div className="field"><label>Notiz</label><textarea value={f.notes} onChange={set("notes")} /></div>
      <button className="btn" disabled={busy} onClick={add}><span>{busy ? "Speichern …" : "Kontakt speichern"}</span></button>
    </div>
  );
}

// Category "folders" — filter inquiries/contacts by asset class.
function Folders({ items, value, onChange, t }) {
  const cats = TYPE_KEYS.filter((k) => items.some((i) => (i.categories || []).includes(k)));
  if (cats.length === 0) return null;
  const count = (k) => items.filter((i) => (i.categories || []).includes(k)).length;
  return (
    <div className="chips" style={{ marginBottom: 20 }}>
      <button className={`chip ${value === "all" ? "on" : ""}`} onClick={() => onChange("all")}>Alle <span style={{ opacity: .6 }}>{items.length}</span></button>
      {cats.map((k) => (
        <button key={k} className={`chip ${value === k ? "on" : ""}`} onClick={() => onChange(k)}>{typeLabel(t, k)} <span style={{ opacity: .6 }}>{count(k)}</span></button>
      ))}
    </div>
  );
}
