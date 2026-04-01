import React from 'react';
import { CheckCircle, Clock, XCircle, User, Award, Check, ShieldCheck } from 'lucide-react';

const Timeline = ({ stage, status, remarks = [] }) => {
  const steps = [
    {
      id: 'submitted',
      title: 'Certificate Submitted',
      description: 'Waiting for Faculty Review',
      icon: User,
      color: 'blue'
    },
    {
      id: 'faculty_review',
      title: 'Faculty Review',
      description: 'Reviewing document quality and authenticity',
      icon: Award,
      color: 'indigo'
    },
    {
      id: 'hod_review',
      title: 'HOD Approval',
      description: 'Final verification and approval',
      icon: CheckCircle,
      color: 'green'
    }
  ];

  const getCurrentStepIndex = () => {
    if (status === 'rejected') return -1;
    if (status === 'approved') return 3;
    if (stage === 'faculty_review') return 1;
    if (stage === 'hod_review') return 2;
    if (stage === 'completed') return 3;
    return 0;
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="py-8">
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-5 left-5 w-[calc(100%-40px)] h-1 bg-gray-100 rounded-full -z-10 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000 ease-in-out"
            style={{ width: `${Math.max(0, Math.min(100, (currentStep - 1) * 50))}%` }}
          />
        </div>

        <div className="flex justify-between items-start">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep || status === 'approved';
            const isActive = index === currentStep - 1 && status !== 'approved';
            const isRejected = status === 'rejected' && ((stage === 'faculty_review' && index === 1) || (stage === 'completed' && index >= 1));
            
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center text-center max-w-[120px] group relative">
                <div 
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    isRejected ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-[0_4px_12px_rgb(225,29,72,0.3)]' :
                    isCompleted ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_4px_12px_rgb(79,70,229,0.4)] md:group-hover:scale-110' :
                    isActive ? 'bg-white border-indigo-600 text-indigo-600 shadow-[0_4px_12px_rgb(79,70,229,0.2)] md:group-hover:scale-110' :
                    'bg-slate-50 border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:bg-white'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="mt-4">
                  <h4 className={`text-[10px] font-black uppercase tracking-[2px] transition-colors ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {step.title}
                  </h4>
                  <p className={`text-xs font-medium mt-1.5 leading-relaxed transition-colors hidden sm:block ${isActive || isCompleted ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    {index === 1 && status === 'rejected' && stage === 'faculty_review' ? 'Declined by Faculty' : 
                     index === 2 && status === 'rejected' ? 'Declined by HOD' : 
                     step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {remarks.length > 0 && (
        <div className="mt-12 space-y-6">
          <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
            <span className="w-6 h-0.5 bg-gray-200 rounded-full"></span> Activity Log Details
          </h4>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {remarks.map((remark, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${remark.role === 'faculty' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {remark.role === 'faculty' ? <Award className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                {/* Timeline Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <p className={`font-black text-[10px] uppercase tracking-[2px] ${remark.role === 'faculty' ? 'text-indigo-600' : 'text-emerald-600'}`}>{remark.role} Evaluation</p>
                    <span className="text-[10px] font-bold text-gray-400 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">{new Date(remark.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed italic">"{remark.comment}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
