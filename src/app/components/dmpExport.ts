import jsPDF from 'jspdf';

export interface DmpData {
  patientName: string;
  patientId?: string | null;
  blood?: string;
  height?: string;
  weight?: string;
  bp?: string;
  allergies: string[];
  antecedents: string[];
  vaccins: { name: string; date: string; status?: string }[];
  urgence: { name: string; relation?: string; phone: string }[];
  traitements?: { name: string; dosage?: string; schedule?: string[] }[];
}

const ESC_XML = (s: string) =>
  String(s ?? '').replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!));

export function exportDmpPdf(data: DmpData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > pageH - margin) { doc.addPage(); y = margin; }
  };

  // Header band
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Carnet de santé numérique', margin, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Healthy Page · DMP export · ${new Date().toLocaleDateString('fr-FR')}`, margin, 19);
  y = 28;

  // Patient block
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(data.patientName || 'Patient', margin, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  if (data.patientId) doc.text(`Identifiant : ${data.patientId}`, margin, y), (y += 4);

  // Vital stats grid
  y += 3;
  const stats = [
    ['Groupe', data.blood ?? '—'],
    ['Taille', data.height ?? '—'],
    ['Poids', data.weight ?? '—'],
    ['Tension', data.bp ?? '—'],
  ];
  const colW = (pageW - margin * 2) / 4;
  stats.forEach(([label, val], i) => {
    const x = margin + i * colW;
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, colW - 2, 16, 2, 2);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x + 3, y + 5);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(String(val), x + 3, y + 12);
    doc.setFont('helvetica', 'normal');
  });
  y += 22;

  const section = (title: string) => {
    ensureSpace(10);
    doc.setFillColor(204, 251, 241);
    doc.rect(margin, y, pageW - margin * 2, 6, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text(title.toUpperCase(), margin + 2, y + 4.2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    y += 9;
  };

  const bullet = (txt: string) => {
    ensureSpace(6);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(`• ${txt}`, pageW - margin * 2 - 4);
    doc.text(lines, margin + 2, y);
    y += lines.length * 4.6;
  };

  section('Allergies');
  if (data.allergies.length === 0) bullet('Aucune renseignée');
  else data.allergies.forEach(bullet);

  section('Antécédents');
  if (data.antecedents.length === 0) bullet('Aucun renseigné');
  else data.antecedents.forEach(bullet);

  section('Vaccinations');
  if (data.vaccins.length === 0) bullet('Aucun vaccin enregistré');
  else data.vaccins.forEach((v) => bullet(`${v.name} — ${v.date}${v.status ? ` (${v.status === 'ok' ? 'à jour' : v.status})` : ''}`));

  if (data.traitements && data.traitements.length > 0) {
    section('Traitements en cours');
    data.traitements.forEach((t) => bullet(`${t.name}${t.dosage ? ` — ${t.dosage}` : ''}${t.schedule?.length ? ` · ${t.schedule.join(', ')}` : ''}`));
  }

  section("Contacts d'urgence");
  if (data.urgence.length === 0) bullet('Non renseigné');
  else data.urgence.forEach((u) => bullet(`${u.name}${u.relation ? ` (${u.relation})` : ''} — ${u.phone}`));

  // Footer
  ensureSpace(14);
  y = pageH - 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Document confidentiel · transmis à la demande du patient · Healthy Page", margin, y + 5);

  const safeName = (data.patientName || 'patient').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  doc.save(`carnet-sante-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportDmpCdaXml(data: DmpData) {
  const now = new Date();
  const ts = now.toISOString();
  const tsCompact = ts.replace(/[-:T]/g, '').slice(0, 14);
  const id = (data.patientId ?? `hp-${Date.now()}`).replace(/[^a-z0-9]/gi, '');

  const allergiesXml = data.allergies.length
    ? data.allergies.map((a) => `      <allergy><name>${ESC_XML(a)}</name></allergy>`).join('\n')
    : '      <!-- aucune -->';
  const antecedentsXml = data.antecedents.length
    ? data.antecedents.map((a) => `      <history><description>${ESC_XML(a)}</description></history>`).join('\n')
    : '      <!-- aucun -->';
  const vaccinsXml = data.vaccins.length
    ? data.vaccins.map((v) => `      <immunization><name>${ESC_XML(v.name)}</name><date>${ESC_XML(v.date)}</date><status>${ESC_XML(v.status ?? '')}</status></immunization>`).join('\n')
    : '      <!-- aucun -->';
  const traitementsXml = (data.traitements ?? []).length
    ? data.traitements!.map((t) => `      <medication><name>${ESC_XML(t.name)}</name><dosage>${ESC_XML(t.dosage ?? '')}</dosage><schedule>${ESC_XML((t.schedule ?? []).join(','))}</schedule></medication>`).join('\n')
    : '      <!-- aucun -->';
  const urgenceXml = data.urgence.length
    ? data.urgence.map((u) => `      <contact><name>${ESC_XML(u.name)}</name><relation>${ESC_XML(u.relation ?? '')}</relation><phone>${ESC_XML(u.phone)}</phone></contact>`).join('\n')
    : '      <!-- aucun -->';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3" xmlns:hp="https://healthypage.app/dmp/v1">
  <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
  <id root="2.25.${id}" extension="${tsCompact}"/>
  <code code="34133-9" codeSystem="2.16.840.1.113883.6.1" displayName="Summarization of episode note"/>
  <title>Carnet de santé — ${ESC_XML(data.patientName)}</title>
  <effectiveTime value="${tsCompact}"/>
  <confidentialityCode code="N" codeSystem="2.16.840.1.113883.5.25"/>
  <languageCode code="fr-FR"/>
  <recordTarget>
    <patientRole>
      <id root="2.25.healthypage.patient" extension="${ESC_XML(data.patientId ?? '')}"/>
      <patient>
        <name>${ESC_XML(data.patientName)}</name>
      </patient>
    </patientRole>
  </recordTarget>
  <author>
    <time value="${tsCompact}"/>
    <assignedAuthor>
      <id root="2.25.healthypage.app"/>
      <assignedAuthoringDevice>
        <softwareName>Healthy Page</softwareName>
      </assignedAuthoringDevice>
    </assignedAuthor>
  </author>
  <component>
    <structuredBody>
      <hp:vitals>
        <hp:bloodGroup>${ESC_XML(data.blood ?? '')}</hp:bloodGroup>
        <hp:height>${ESC_XML(data.height ?? '')}</hp:height>
        <hp:weight>${ESC_XML(data.weight ?? '')}</hp:weight>
        <hp:bloodPressure>${ESC_XML(data.bp ?? '')}</hp:bloodPressure>
      </hp:vitals>
      <hp:allergies>
${allergiesXml}
      </hp:allergies>
      <hp:medicalHistory>
${antecedentsXml}
      </hp:medicalHistory>
      <hp:immunizations>
${vaccinsXml}
      </hp:immunizations>
      <hp:medications>
${traitementsXml}
      </hp:medications>
      <hp:emergencyContacts>
${urgenceXml}
      </hp:emergencyContacts>
    </structuredBody>
  </component>
</ClinicalDocument>
`;

  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (data.patientName || 'patient').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  a.href = url;
  a.download = `dmp-${safeName}-${now.toISOString().slice(0, 10)}.xml`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
