# APEX Motorsport Hub – serverlose Android-PWA

Diese Variante benötigt **keinen eigenen Backend-Server und keinen dauerhaft laufenden Prozess**. Die Oberfläche wird als statische Website bereitgestellt. Beim Öffnen bzw. Aktualisieren versucht die App, RSS-Suchergebnisse direkt im Browser zu laden. News-Lesezeichen werden auf dem Android-Gerät in `localStorage` gespeichert.

## Wichtige Grenzen
- Für eine installierbare PWA braucht es weiterhin eine HTTPS-Webadresse. Du kannst die statischen Dateien z. B. über GitHub Pages oder einen anderen statischen Website-Host bereitstellen; dort läuft kein eigener News-Server.
- Viele Nachrichten-RSS-Feeds blockieren Browserzugriffe von anderen Domains per CORS. Deshalb nutzt diese Demo den öffentlichen CORS-Proxy `proxy.cors.dev`. Das ist ein externer Drittanbieter, nicht dein eigener Server. Seine Verfügbarkeit, Datenschutzbedingungen, Limits und Nutzungsbedingungen können sich ändern. Fällt der Proxy aus, können News nicht aktualisiert werden.
- Die Aktualisierung passiert beim Öffnen, beim Betätigen von „Aktualisieren“ und wenn die App wieder in den Vordergrund kommt. Es gibt keinen zuverlässigen Refresh, während die App geschlossen ist.
- Die News kommen aus Google-News-RSS-Suchabfragen; die Quelle wird aus den RSS-Metadaten übernommen, soweit verfügbar. Nicht jede Meldung ist garantiert erreichbar oder vollständig. Artikel werden beim Verlag geöffnet, keine Volltexte kopiert.
- „Silly Season“ hat die Kategorien **Bestätigt** und **Gerücht**, aber diese statische Version erfindet keine Transfermeldungen. Einträge können manuell im Bereich „Eintrag hinzufügen“ auf diesem Gerät gespeichert werden.
- Meisterschaftsstände: In dieser serverlosen Demo können Tabellen manuell auf dem Gerät gepflegt werden. Automatische, verlässliche Punktestände für alle zehn Serien erfordern passende Datenquellen/APIs; diese sind hier nicht integriert.
- Favoriten, manuelle Silly-Season-Einträge und Tabellen liegen nur lokal in diesem Browserprofil. Browserdaten löschen oder Gerätewechsel kann sie entfernen.

## Auf Android installieren
1. Den Inhalt dieses Ordners auf einen statischen HTTPS-Host hochladen.
2. Die Website in Chrome auf Android öffnen.
3. Chrome-Menü `⋮` → `App installieren` oder `Zum Startbildschirm hinzufügen`.
4. In der App auf `News aktualisieren` tippen. Beim erneuten Öffnen wird ebenfalls aktualisiert.

Es ist kein APK- oder PC-Installationsprogramm enthalten – dies ist eine installierbare Web-App (PWA).
