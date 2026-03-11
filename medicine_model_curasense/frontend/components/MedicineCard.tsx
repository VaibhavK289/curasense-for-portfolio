import { Medicine } from "@/lib/api";
import { CheckCircle, XCircle, AlertCircle, Info, DollarSign, FlaskConical } from "lucide-react";

interface Props {
  medicine: Medicine;
  variant?: "default" | "compact";
}

function Tag({ text, color }: { text: string; color: string }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mr-1.5 mb-1.5 ${color}`}>
      {text}
    </span>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function MedicineCard({ medicine, variant = "default" }: Props) {
  const {
    name,
    composition,
    dosage_mg,
    price,
    estimated_cost_inr,
    uses,
    side_effects,
    warnings,
    contraindications,
    manufacturer,
    pros,
    cons,
    similar_medicines,
  } = medicine;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4">
        <h3 className="text-lg font-bold text-white">{name ?? "Unknown"}</h3>
        {manufacturer && (
          <p className="text-blue-100 text-xs mt-0.5">{manufacturer}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {dosage_mg && (
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
              {dosage_mg} mg
            </span>
          )}
          {(price || estimated_cost_inr) && (
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <DollarSign size={10} />
              {estimated_cost_inr ?? price}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        {/* Composition */}
        {composition && (
          <Section icon={<FlaskConical size={14} className="text-purple-500" />} title="Composition">
            <p className="text-sm text-slate-600">{composition}</p>
          </Section>
        )}

        {/* Uses */}
        {uses && uses.length > 0 && (
          <Section icon={<Info size={14} className="text-blue-500" />} title="Uses">
            <div className="flex flex-wrap">
              {uses.map((u) => (
                <Tag key={u} text={u} color="bg-blue-50 text-blue-700" />
              ))}
            </div>
          </Section>
        )}

        {/* Pros / Cons */}
        {(pros?.length || cons?.length) && variant === "default" ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {pros && pros.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <CheckCircle size={13} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pros</span>
                </div>
                <ul className="space-y-1">
                  {pros.map((p) => (
                    <li key={p} className="text-xs text-slate-600 flex items-start gap-1">
                      <span className="mt-0.5 text-emerald-400">•</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cons && cons.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <XCircle size={13} className="text-red-400" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cons</span>
                </div>
                <ul className="space-y-1">
                  {cons.map((c) => (
                    <li key={c} className="text-xs text-slate-600 flex items-start gap-1">
                      <span className="mt-0.5 text-red-400">•</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {/* Side Effects */}
        {side_effects && side_effects.length > 0 && (
          <Section icon={<AlertCircle size={14} className="text-amber-500" />} title="Side Effects">
            <div className="flex flex-wrap">
              {side_effects.map((s) => (
                <Tag key={s} text={s} color="bg-amber-50 text-amber-700" />
              ))}
            </div>
          </Section>
        )}

        {/* Warnings */}
        {warnings && warnings.length > 0 && variant === "default" && (
          <Section icon={<AlertCircle size={14} className="text-red-500" />} title="Warnings">
            <ul className="space-y-1">
              {warnings.map((w) => (
                <li key={w} className="text-xs text-slate-600 flex items-start gap-1.5">
                  <span className="mt-0.5 text-red-400 flex-shrink-0">⚠</span> {w}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Contraindications */}
        {contraindications && contraindications.length > 0 && variant === "default" && (
          <Section icon={<XCircle size={14} className="text-red-500" />} title="Contraindications">
            <div className="flex flex-wrap">
              {contraindications.map((c) => (
                <Tag key={c} text={c} color="bg-red-50 text-red-700" />
              ))}
            </div>
          </Section>
        )}

        {/* Similar Medicines */}
        {similar_medicines && similar_medicines.length > 0 && variant === "default" && (
          <Section icon={<FlaskConical size={14} className="text-slate-400" />} title="Similar Medicines">
            <div className="flex flex-wrap">
              {similar_medicines.map((s) => (
                <Tag key={s} text={s} color="bg-slate-100 text-slate-600" />
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
