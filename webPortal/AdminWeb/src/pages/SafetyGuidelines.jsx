import React from 'react';
import { Download, FileText, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

const SafetyGuidelines = () => {
    const handleDownloadPDF = () => {
        alert('Downloading Safety_Guidelines_v2024.pdf...');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Safety Guidelines & Protocols</h1>
                    <p className="text-slate-500 mt-2">
                        Official workplace safety standards and emergency procedures.
                        <br />
                        <span className="text-xs text-slate-400">Last updated: December 15, 2024</span>
                    </p>
                </div>
            </div>

            {/* Document Content */}
            <div className="card space-y-8 p-8 md:p-12">

                {/* Section 1 */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="text-blue-600" size={24} />
                        <h2 className="text-2xl font-bold text-slate-800">1. General Workplace Safety</h2>
                    </div>
                    <div className="prose text-slate-600 leading-relaxed space-y-4">
                        <p>
                            All employees and visitors must adhere to the following general safety rules to ensure a secure working environment.
                            Safety is everyone's responsibility.
                        </p>
                        <ul className="space-y-2 list-none pl-1">
                            {[
                                "Always wear your ID badge while on company premises.",
                                "Report any unsafe conditions or hazards to a supervisor immediately.",
                                "Keep walkways and emergency exits clear of obstructions at all times.",
                                "Do not operate machinery or equipment unless you are trained and authorized."
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 size={16} className="text-green-500 mt-1 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <hr className="border-slate-100" />

                {/* Section 2 */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="text-orange-500" size={24} />
                        <h2 className="text-2xl font-bold text-slate-800">2. Emergency Procedures</h2>
                    </div>
                    <div className="prose text-slate-600 leading-relaxed space-y-4">
                        <p>
                            In case of an emergency, stay calm and follow the designated protocols.
                        </p>
                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-6">
                            <h3 className="font-bold text-orange-800 mb-2">Fire Emergency</h3>
                            <p className="text-orange-700 text-sm mb-4">
                                If you discover a fire or see smoke, immediately activate the nearest fire alarm manual pull station.
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-orange-800 font-medium">
                                <li><strong>Rescue:</strong> Assist anyone in immediate danger if safe to do so.</li>
                                <li><strong>Alarm:</strong> Activate the nearest fire alarm.</li>
                                <li><strong>Contain:</strong> Close doors/windows to contain the fire (do not lock).</li>
                                <li><strong>Evacuate:</strong> Leave via the nearest safe exit. Do not use elevators.</li>
                            </ol>
                        </div>
                    </div>
                </section>

                <hr className="border-slate-100" />

                {/* Section 3 */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="text-indigo-500" size={24} />
                        <h2 className="text-2xl font-bold text-slate-800">3. Personal Protective Equipment (PPE)</h2>
                    </div>
                    <div className="prose text-slate-600 leading-relaxed">
                        <p className="mb-4">
                            Appropriate PPE must be worn in designated areas. Signs are posted in all areas requiring specific protective gear.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded border border-slate-100">
                                <h4 className="font-bold text-slate-700">Production Floor</h4>
                                <p className="text-sm mt-1">Safety glasses, steel-toed boots, and high-visibility vests are mandatory.</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded border border-slate-100">
                                <h4 className="font-bold text-slate-700">Chemical Lab</h4>
                                <p className="text-sm mt-1">Lab coats, safety goggles, and nitrile gloves must be worn at all times.</p>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            {/* Footer Download Action */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleDownloadPDF}
                    className="btn btn-outline text-xs py-1 px-3"
                    style={{
                        fontSize: '1rem',
                        backgroundColor: '#3883e4c3',
                        textAlign: "center",
                        color: "white",
                        fontWeight: "bold",
                        display: 'flex',
                        margin: '0 auto',
                        alignItems: 'center',
                        padding: '10px 20px',

                    }}
                >
                    <Download size={20} className="mr-2" />
                    Download PDF
                </button>
            </div>
        </div>
    );
};

export default SafetyGuidelines;
