"use client";
import { authFetch } from "@/lib/authFetch";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, ChevronRight, Briefcase, Building, Target, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function Onboarding() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "", company: "", exp: "", days: "30"
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      setErrorMsg("");
    } else {
      setErrorMsg("Please upload a valid PDF file.");
    }
  };

  const handleNext = () => setStep(s => s + 1);

  const handleSubmit = async () => {
    if (!resumeFile) {
      setErrorMsg("Resume upload is mandatory.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("role", formData.role);
    data.append("company", formData.company);
    data.append("exp", formData.exp);
    data.append("days", formData.days);
    data.append("resume", resumeFile);

    try {
      const res = await authFetch("http://localhost:8000/api/onboarding", {
        method: "POST",
        body: data
      });

      if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.detail || "Processing failed.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize workspace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <GlassCard className="p-8 md:p-12 relative overflow-hidden" glow>
          {/* Progress bar */}
          <div className="absolute top-0 left-0 h-1 bg-white/10 w-full">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step / 2) * 100}%` }} />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Workspace</h1>
            <p className="text-gray-400">Tell us your targets to customize your AI plan.</p>
          </div>

          {step === 1 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Target Role</label>
                <select
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary text-white"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="" disabled>Select Role</option>
                  <option value="Software Engineer (SDE)">Software Engineer (SDE)</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Data Engineer">Data Engineer</option>
                  <option value="ML Engineer">Machine Learning Engineer</option>
                  <option value="AI Engineer">AI/LLM Engineer</option>
                  <option value="DevOps Engineer">DevOps & SRE Engineer</option>
                  <option value="Cloud Architect">Cloud Architect</option>
                  <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="QA Engineer">QA Engineer / Tester</option>
                  <option value="System Administrator">System Administrator</option>
                  <option value="Blockchain Developer">Blockchain Developer</option>
                  <option value="Mobile Developer">Mobile Developer (iOS/Android)</option>
                  <option value="Game Developer">Game Developer</option>
                  <option value="Hardware Engineer">Hardware / Embedded Systems Engineer</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium flex items-center gap-2"><Building className="w-4 h-4 text-blue-400" /> Target Company</label>
                  <select
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })}
                  >
                    <option value="" disabled>Select Target Company</option>
                    <option value="Startup / Mid-Sized Company">Startup / Mid-Sized Company</option>
                    <option value="Google">Google</option>
                    <option value="Microsoft">Microsoft</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Meta">Meta</option>
                    <option value="Apple">Apple</option>
                    <option value="Netflix">Netflix</option>
                    <option value="Stripe">Stripe</option>
                    <option value="Uber">Uber</option>
                    <option value="Airbnb">Airbnb</option>
                    <option value="Goldman Sachs">Goldman Sachs</option>
                    <option value="JP Morgan">JP Morgan Chase</option>
                    <option value="Bloomberg">Bloomberg</option>
                    <option value="TCS">TCS</option>
                    <option value="Infosys">Infosys</option>
                    <option value="Wipro">Wipro</option>
                    <option value="Accenture">Accenture</option>
                    <option value="Deloitte">Deloitte</option>
                    <option value="Cognizant">Cognizant</option>
                    <option value="Capgemini">Capgemini</option>
                    <option value="IBM">IBM</option>
                    <option value="HCL">HCL Technologies</option>
                    <option value="Tech Mahindra">Tech Mahindra</option>
                    <option value="Oracle">Oracle</option>
                    <option value="Cisco">Cisco</option>
                    <option value="Adobe">Adobe</option>
                    <option value="Salesforce">Salesforce</option>
                    <option value="ServiceNow">ServiceNow</option>
                    <option value="Zoho">Zoho</option>
                    <option value="Freshworks">Freshworks</option>
                    <option value="Swiggy">Swiggy / Zomato</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Paytm">Paytm</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium flex items-center gap-2"><Briefcase className="w-4 h-4 text-orange-400" /> Experience</label>
                  <select className="w-full bg-[#18181b] border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-orange-500 text-white"
                    value={formData.exp} onChange={e => setFormData({ ...formData, exp: e.target.value })}>
                    <option value="" disabled>Select Level</option>
                    <option value="entry">Entry Level (0-2 YOE)</option>
                    <option value="mid">Mid Level (3-5 YOE)</option>
                    <option value="senior">Senior (5+ YOE)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-green-400">Preparation Days</label>
                <input type="number" placeholder="Days to prep (e.g. 30)" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.days} onChange={e => setFormData({ ...formData, days: e.target.value })} />
              </div>

              <button onClick={handleNext} className="w-full py-4 mt-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors">
                Next Step <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Resume (PDF)</label>
                <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed ${resumeFile ? 'border-primary/50 bg-primary/5' : 'border-white/20'} rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:bg-white/5 hover:border-primary/50 transition-colors cursor-pointer group`}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-semibold text-lg mb-1">{resumeFile ? resumeFile.name : 'Click to browse device'}</p>
                  <p className="text-gray-500 text-sm">PDF format only (Mandatory)</p>
                </div>
              </div>

              {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}

              <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Initializing Workspace & AI Parsing...</> : "Initialize Workspace"}
              </button>
            </motion.div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
