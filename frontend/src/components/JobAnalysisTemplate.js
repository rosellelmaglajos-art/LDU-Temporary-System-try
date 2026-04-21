import React from 'react';

export default function JobAnalysisTemplate({ id }) {
  return (
    <div id={id} className="pdf-wrapper bg-white text-black font-serif text-[11pt] w-[750px] p-[20px] mx-auto box-border">
      <style>{`
        .pdf-wrapper table { width: 100%; border-collapse: collapse; margin: 0; padding: 0; }
        .pdf-wrapper td { border: 1px solid black; padding: 4px 5px; vertical-align: top; font-size: 10pt; }
        .pdf-wrapper .bg-blue-light { background-color: #A6C9EC; }
        .pdf-wrapper .bg-blue-pale { background-color: #DAE9F8; }
      `}</style>
      <table>
        <tbody>
          <tr>
            <td className="border-b-0">
              <div className="flex items-center gap-[15px] p-[5px]">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Department_of_Transportation_%28Philippines%29.svg/330px-Department_of_Transportation_%28Philippines%29.svg.png" width="70" alt="DOTr" crossOrigin="anonymous"/>
                <div>
                  <p className="m-0 leading-tight">Republic of the Philippines</p>
                  <p className="m-0 font-bold leading-tight">DEPARTMENT OF TRANSPORTATION</p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <table>
        <tbody>
          <tr><td className="bg-blue-light text-center p-[5px]"><p className="font-bold text-[14pt] m-0">JOB ANALYSIS FORM</p></td></tr>
        </tbody>
      </table>
      <table>
        <colgroup><col style={{width: '25%'}}/><col style={{width: '75%'}}/></colgroup>
        <tbody>
          <tr><td><span className="font-bold">Full Name:</span></td><td><span id="pdf-ja-fullname" className="font-bold pl-[5px]"></span></td></tr>
          <tr><td><span className="font-bold">Position Title:</span></td><td><span id="pdf-ja-position" className="font-bold pl-[5px]"></span></td></tr>
        </tbody>
      </table>
      <table>
        <tbody>
          <tr><td className="bg-blue-pale text-center border-b-[3px] border-double border-black p-[5px]"><p className="font-bold m-0">JOB PURPOSE</p></td></tr>
          <tr><td className="min-h-[60px] align-top"><div id="pdf-ja-purpose" className="whitespace-pre-wrap mt-[5px] p-[5px]"></div></td></tr>
        </tbody>
      </table>
    </div>
  );
}
