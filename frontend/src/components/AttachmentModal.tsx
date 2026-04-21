import React, { useState, useEffect } from 'react';
import { X, Printer, Edit2, FileText } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
  orgInfo: any;
}

function numberToWords(num: number): string {
  if (!num || num === 0) return 'Zero Birr Only';
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty ','Thirty ','Forty ','Fifty ', 'Sixty ','Seventy ','Eighty ','Ninety '];

  const converter = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n/10)] + (n%10 !== 0 ? a[n%10] : '');
    if (n < 1000) return a[Math.floor(n/100)] + 'Hundred ' + (n%100 !== 0 ? 'and ' + converter(n%100) : '');
    if (n < 1000000) return converter(Math.floor(n/1000)) + 'Thousand ' + (n%1000 !== 0 ? converter(n%1000) : '');
    return n.toString();
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let res = converter(integerPart) + 'Birr';
  if (decimalPart > 0) {
    res += ' and ' + converter(decimalPart) + 'Cents';
  }
  return res.trim() + ' Only';
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({ isOpen, onClose, sale, orgInfo }) => {
  const [headerInfo, setHeaderInfo] = useState({
    name: 'Betelhem Taye Worku',
    address: 'A.A S/C Kolfe Keranyo W. 06 H No. New Around bethel Square',
    phones: '0911785485 / 0922001111',
    tin: '0043735412'
  });

  const [billTo, setBillTo] = useState('');
  const [billToTIN, setBillToTIN] = useState('');
  const [fsNo, setFsNo] = useState('');

  const initializedRef = React.useRef(false);

  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      return;
    }

    if (isOpen && sale && !initializedRef.current) {
      if (orgInfo) {
        setHeaderInfo({
          name: orgInfo.name || 'Betelhem Taye Worku',
          address: orgInfo.address || 'A.A S/C Kolfe Keranyo W. 06 H No. New Around bethel Square',
          phones: orgInfo.phone || '0911785485 / 0922001111',
          tin: orgInfo.tin_number || '0043735412'
        });
      }
      setBillTo(sale.patient?.name || 'Walk-in Customer');
      setFsNo(sale.receipt_number || '');
      initializedRef.current = true; // Prevents overwriting what the user types
    }
  }, [isOpen, sale, orgInfo]);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Receipt_${sale.receipt_number || 'Cash_Sales'}`;
    window.print();
    document.title = originalTitle;
  };

  const items = sale.items || [];
  
  const rawSubtotal = items.reduce((sum: number, item: any) => sum + (parseFloat(item.unit_price) * parseInt(item.quantity || '0')), 0);
  const tax = rawSubtotal * 0.02;
  const grandTotal = rawSubtotal + tax;

  const words = numberToWords(grandTotal);

  return (
    <>
      {/* ─── Screen Modal (Hidden on Print) ─── */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm print:hidden">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" /> Print Attachment Settings
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto flex flex-col lg:flex-row min-h-0 bg-gray-50">
            {/* Editor Sidebar */}
            <div className="w-full lg:w-80 p-5 bg-white border-r border-gray-100 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 flex items-center gap-1.5"><Edit2 className="w-3.5 h-3.5" /> Header Details</h3>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pharmacy Name</label>
                  <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all" value={headerInfo.name} onChange={e => setHeaderInfo({ ...headerInfo, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Address</label>
                  <textarea rows={2} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all resize-none" value={headerInfo.address} onChange={e => setHeaderInfo({ ...headerInfo, address: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tel</label>
                  <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all" value={headerInfo.phones} onChange={e => setHeaderInfo({ ...headerInfo, phones: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pharmacy TIN</label>
                  <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all" value={headerInfo.tin} onChange={e => setHeaderInfo({ ...headerInfo, tin: e.target.value })} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-50 pb-2">Customer Info</h3>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Bill To (Name)</label>
                  <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all" value={billTo} onChange={e => setBillTo(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Customer TIN (Optional)</label>
                  <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all" value={billToTIN} onChange={e => setBillToTIN(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">FS NO (Receipt Base)</label>
                  <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all" value={fsNo} onChange={e => setFsNo(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Live Preview Pane */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-100 custom-scrollbar flex flex-col items-center">
              <div className="w-full max-w-2xl bg-white shadow-md p-10 border border-gray-300 min-h-[842px] pointer-events-none transform origin-top mx-auto" style={{
                 transform: 'scale(0.85)',
                 marginBottom: '-15%'
              }}>
                 <div className="text-center font-serif text-black space-y-1 mb-8">
                    <h1 className="text-3xl font-bold font-serif mb-2">{headerInfo.name}</h1>
                    <p className="text-base">{headerInfo.address}</p>
                    <p className="text-base">Tel: {headerInfo.phones}</p>
                    <p className="text-base">TIN: {headerInfo.tin}</p>
                    <div className="mt-6 mb-2">
                      <span className="text-xl font-bold underline px-8 pb-1 border-b-2 border-black inline-block">Cash Sales Attachment</span>
                    </div>
                  </div>

                  <div className="mb-6 w-full max-w-md">
                    <table className="w-full text-black border-collapse font-serif text-[15px]">
                      <tbody>
                        <tr>
                          <td className="border border-black px-2 py-1.5 font-bold w-1/4">Date</td>
                          <td className="border border-black px-2 py-1.5">{formatDate(sale.created_at)}</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-2 py-1.5 font-bold">Bill to</td>
                          <td className="border border-black px-2 py-1.5">{billTo}</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-2 py-1.5 font-bold">TIN</td>
                          <td className="border border-black px-2 py-1.5">{billToTIN}</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-2 py-1.5 font-bold">FS NO</td>
                          <td className="border border-black px-2 py-1.5">{fsNo}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <table className="w-full text-black border-collapse font-serif text-[15px] mb-8">
                    <thead>
                      <tr>
                        <th className="border border-black px-2 py-1.5 font-bold text-left w-16">ID</th>
                        <th className="border border-black px-2 py-1.5 font-bold text-left">Description</th>
                        <th className="border border-black px-2 py-1.5 font-bold text-center w-16">Unit</th>
                        <th className="border border-black px-2 py-1.5 font-bold text-center w-12">Qy</th>
                        <th className="border border-black px-2 py-1.5 font-bold text-right w-24">Price</th>
                        <th className="border border-black px-2 py-1.5 font-bold text-right w-32">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any, i: number) => {
                        const medicineInfo = item.medicine || item;
                        return (
                          <tr key={i}>
                            <td className="border border-black px-2 py-2 truncate">{medicineInfo.sku || medicineInfo.id?.slice(0, 5) || (i+1)}</td>
                            <td className="border border-black px-2 py-2">{medicineInfo.name}</td>
                            <td className="border border-black px-2 py-2 text-center">{medicineInfo.unit || 'PCS'}</td>
                            <td className="border border-black px-2 py-2 text-center">{item.quantity}</td>
                            <td className="border border-black px-2 py-2 text-right">{Number(item.unit_price).toFixed(2)}</td>
                            <td className="border border-black px-2 py-2 text-right">{(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
                        <tr key={`empty-${i}`}>
                          <td className="border border-black px-2 py-3">&nbsp;</td>
                          <td className="border border-black px-2 py-3">&nbsp;</td>
                          <td className="border border-black px-2 py-3">&nbsp;</td>
                          <td className="border border-black px-2 py-3">&nbsp;</td>
                          <td className="border border-black px-2 py-3">&nbsp;</td>
                          <td className="border border-black px-2 py-3">&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end mb-6">
                    <table className="w-64 text-black border-collapse font-serif text-[15px]">
                      <tbody>
                        <tr>
                          <td className="border border-black px-2 py-1.5 font-bold">Subtotal</td>
                          <td className="border border-black px-2 py-1.5 text-right">{rawSubtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-2 py-1.5 font-bold">TOT 2%</td>
                          <td className="border border-black px-2 py-1.5 text-right">{tax.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-2 py-1.5 font-bold">Grand Total</td>
                          <td className="border border-black px-2 py-1.5 text-right">{grandTotal.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-4 font-serif text-[15px] text-black">
                    <div className="flex gap-2 items-end">
                      <span className="font-bold whitespace-nowrap">Amount in Words</span>
                      <div className="flex-1 border-b border-black text-center pb-0.5" style={{ minWidth: "200px" }}>{words}</div>
                    </div>
                    <div className="flex gap-2 items-end max-w-sm">
                      <span className="font-bold whitespace-nowrap">Prepared By</span>
                      <div className="flex-1 border-b border-black"></div>
                    </div>
                    <div className="flex gap-2 items-end max-w-sm">
                      <span className="font-bold whitespace-nowrap">Approved By</span>
                      <div className="flex-1 border-b border-black"></div>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 z-10 shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.02)]">
            <button onClick={onClose} className="px-5 py-2.5 bg-white text-gray-700 font-black rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors uppercase tracking-widest text-xs">
              Cancel
            </button>
            <button onClick={handlePrint} className="px-5 py-2.5 bg-indigo-600 text-white font-black rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
              <Printer className="w-4 h-4" />
              Print Attachment
            </button>
          </div>
        </div>
      </div>

      {/* ─── Absolute Print Yield (Only flashes onto paper cleanly) ─── */}
      <div id="print-attachment-area" className="hidden print:block bg-white text-black font-serif" style={{backgroundColor: "white"}}>
        <style>
          {`
            @media print {
              body, html {
                visibility: hidden;
                margin: 0;
                padding: 0;
              }
              #print-attachment-area, #print-attachment-area * { 
                visibility: visible; 
              }
              #print-attachment-area { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
              }
            }
            @page { margin: 10mm; size: A4 portrait; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important;}
          `}
        </style>
        
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-2xl font-bold font-serif mb-1 text-black">{headerInfo.name}</h1>
          <p className="text-base text-black">{headerInfo.address}</p>
          <p className="text-base text-black">Tel: {headerInfo.phones}</p>
          <p className="text-base text-black">TIN: {headerInfo.tin}</p>
          <div className="mt-4 mb-2">
            <span className="text-xl font-bold border-b-[2px] border-black pb-0.5 inline-block text-black">Cash Sales Attachment</span>
          </div>
        </div>

        <div className="mb-4 w-full max-w-sm">
          <table className="w-full text-black border-collapse text-base">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 font-bold w-1/4">Date</td>
                <td className="border border-black px-2 py-1">{formatDate(sale.created_at)}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-bold">Bill to</td>
                <td className="border border-black px-2 py-1">{billTo}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-bold">TIN</td>
                <td className="border border-black px-2 py-1">{billToTIN}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-bold">FS NO</td>
                <td className="border border-black px-2 py-1">{fsNo}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <table className="w-full text-black border-collapse text-base mb-6 outline outline-black" style={{outlineWidth: '1px'}}>
          <thead>
            <tr className="bg-white text-black">
              <th className="border border-black px-2 py-1.5 font-bold text-left w-20 text-black">ID</th>
              <th className="border border-black px-2 py-1.5 font-bold text-left text-black">Description</th>
              <th className="border border-black px-2 py-1.5 font-bold text-center w-20 text-black">Unit</th>
              <th className="border border-black px-2 py-1.5 font-bold text-center w-16 text-black">Qy</th>
              <th className="border border-black px-2 py-1.5 font-bold text-right w-28 text-black">Price</th>
              <th className="border border-black px-2 py-1.5 font-bold text-right w-32 text-black">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, i: number) => {
              const medicineInfo = item.medicine || item;
              return (
                <tr key={i}>
                  <td className="border border-black px-2 py-1.5 truncate">{medicineInfo.sku || medicineInfo.id?.slice(0, 5) || (i+1)}</td>
                  <td className="border border-black px-2 py-1.5">{medicineInfo.name}</td>
                  <td className="border border-black px-2 py-1.5 text-center">{medicineInfo.unit || 'PCS'}</td>
                  <td className="border border-black px-2 py-1.5 text-center">{item.quantity}</td>
                  <td className="border border-black px-2 py-1.5 text-right">{Number(item.unit_price).toFixed(2)}</td>
                  <td className="border border-black px-2 py-1.5 text-right">{(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}</td>
                </tr>
              );
            })}
            {Array.from({ length: Math.max(0, 6 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-black px-2 py-3">&nbsp;</td>
                <td className="border border-black px-2 py-3">&nbsp;</td>
                <td className="border border-black px-2 py-3">&nbsp;</td>
                <td className="border border-black px-2 py-3">&nbsp;</td>
                <td className="border border-black px-2 py-3">&nbsp;</td>
                <td className="border border-black px-2 py-3">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-4 text-black">
          <table className="w-64 text-black border-collapse text-base">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 font-bold">Subtotal</td>
                <td className="border border-black px-2 py-1 text-right">{rawSubtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-bold">TOT 2%</td>
                <td className="border border-black px-2 py-1 text-right">{tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 font-bold">Grand Total</td>
                <td className="border border-black px-2 py-1 text-right">{grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-4 text-black text-base" style={{ pageBreakInside: 'avoid' }}>
          <div className="flex gap-3 items-end">
            <span className="font-bold whitespace-nowrap">Amount in Words</span>
            <div className="flex-1 border-b border-black text-center min-w-[250px]">{words}</div>
          </div>
          <div className="flex gap-3 items-end max-w-xs">
            <span className="font-bold whitespace-nowrap">Prepared By</span>
            <div className="flex-1 border-b border-black"></div>
          </div>
          <div className="flex gap-3 items-end max-w-xs">
            <span className="font-bold whitespace-nowrap">Approved By</span>
            <div className="flex-1 border-b border-black"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttachmentModal;
