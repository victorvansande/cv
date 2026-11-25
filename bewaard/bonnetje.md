# Bewaard: de printer met het bonnetje

Op Victors vraag (nov 2026) uit de site gehaald: de site eindigt nu met
Contact. Het blok is hier bewaard om het later eventueel terug te zetten.
Dit bestand is geen pagina van de site.

## Terugzetten

1. Plak het fragment hieronder in `index.html`, in `#contact`, net na
   `</dl>` van `.contact-list` en voor de `</div>` die `.wrap` sluit.
2. Zet het script terug in de head, onder `stapel.js`:
   `<script src="bonnetje.js?v=15" defer></script>` (en hoog de versie op).
3. Alles wat het nodig heeft, staat nog op zijn plaats: `bonnetje.js`, de css
   onder "Snapshot" en "Lattice Loader" in `style.css`, de Engelse teksten
   (`snap_*` in `i18n.js`, "Print een bonnetje" in `I18N.enAria`) en de
   werking zoals beschreven in CLAUDE.md onder "Snapshot op een bonnetje" en
   "Schuifknop om te printen".
4. De inhoud van het bonnetje komt uit `.essentie .facts` en uit de
   contactgegevens in `bonnetje.js`: kijk na of die nog kloppen.

## Het fragment

```html
      <!-- Snapshot: de kern van de site op een bonnetje, te bewaren als
           afbeelding. De zinnen voor de knop staan als verborgen sjablonen,
           zodat ze langs de gewone weg vertaald worden (bonnetje.js). -->
      <div class="snap">
        <div class="snap-txt">
          <p class="label" data-i18n="snap_lbl">Voor later</p>
          <h3 class="sec-sub" data-i18n="snap_h">Neem een snapshot mee</h3>
          <p class="sec-lead" data-i18n="snap_lead">De kern van deze site op één bonnetje, om te bewaren als afbeelding.</p>
          <div class="btn-row">
            <!-- één element dat van vorm verandert (bonnetje.js, naar de Slide to Confirm van
                 Kokonut UI): eerst een schuif, tijdens het printen een voortgangsbalk, daarna
                 krimpt het tot een knop om het bonnetje te bewaren -->
            <div class="schuif" data-staat="rust">
              <span class="schuif-vul" aria-hidden="true"></span>
              <span class="schuif-voort" aria-hidden="true"></span>
              <span class="schuif-txt" data-i18n="snap_slide" aria-hidden="true">Schuif om te printen</span>
              <span class="schuif-status"></span>
              <button type="button" class="schuif-greep" aria-label="Print een bonnetje"><svg class="ic-print" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/></svg><svg class="ic-pijl" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg></button>
              <button type="button" class="schuif-bewaar" tabindex="-1"><span class="schuif-bewaar-in"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg><span class="schuif-bewaar-txt"></span></span></button>
            </div>
          </div>
          <p class="snap-hint" data-i18n="snap_hint" hidden>Trek het bonnetje opzij of omhoog om het af te scheuren.</p>
          <span data-sjabloon="print" data-i18n="snap_btn" hidden>Print een bonnetje</span>
          <span data-sjabloon="bezig" data-i18n="snap_busy" hidden>Bezig met printen…</span>
          <span data-sjabloon="bewaar" data-i18n="snap_save" hidden>Bewaar als afbeelding</span>
          <span data-sjabloon="klaar" data-i18n="snap_done" hidden>Klaar in</span>
          <span data-sjabloon="bewaard" data-i18n="snap_saved" hidden>Bewaard</span>
          <span data-sjabloon="dank" data-i18n="snap_thanks" hidden>Bedankt voor je bezoek.</span>
        </div>
        <div class="snap-area" aria-live="polite">
          <div class="snap-feed">
            <div class="snap-paper"><div class="snap-sheet"><canvas class="snap-cv" role="img" aria-label="Bonnetje met de kern van het cv van Victor Van Sande"></canvas></div></div>
          </div>
          <div class="snap-printer" aria-hidden="true"><span class="snap-slot"></span><span class="snap-merk" translate="no">CV Printer 9000</span><i class="snap-led"></i></div>
        </div>
      </div>
```
