import React from 'react';

export default function NominationTemplate({ id }) {
  return (
    <div id={id} className="pdf-wrapper bg-white text-black font-serif text-[10pt] w-[750px] p-[20px_30px] mx-auto box-border">
      <style>{`
        .pdf-wrapper table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .pdf-wrapper th, .pdf-wrapper td { border: 1px solid #000; padding: 5px 6px; vertical-align: top; text-align: left; }
        .pdf-wrapper .section-header { background-color: #DDD9C3; font-weight: bold; font-size: 10pt; }
        .pdf-wrapper .input-line-pdf { border-bottom: 1px solid black; display: inline-block; min-height: 14px; width: 90%; }
      `}</style>
      <table>
        <tbody>
          <tr>
            <td rowSpan="3" className="text-center w-[160px] align-middle">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Department_of_Transportation_%28Philippines%29.svg/330px-Department_of_Transportation_%28Philippines%29.svg.png" alt="DOTr" className="w-[60px] inline-block mx-1" crossOrigin="anonymous"/>
            </td>
            <td colSpan="3" className="text-left p-[10px!important]">
              <span className="block text-[13pt]">Republic of the Philippines</span>
              <strong className="text-[13pt]">Department of Transportation</strong>
            </td>
          </tr>
          <tr>
            <td>Document No:<br/>DOTr-HRDD-Forms-001</td>
            <td>Rev. No.: 005</td>
            <td>Effective Date: _______ 2025</td>
          </tr>
          <tr>
            <td colSpan="3" className="text-center font-bold text-[11pt]">LEARNING AND DEVELOPMENT NOMINATION FORM</td>
          </tr>
        </tbody>
      </table>

      <table>
        <tbody>
          <tr><td colSpan="3" className="section-header">I. Training/Program Information</td></tr>
          <tr>
            <td colSpan="3"><strong>Title of Training/Course:</strong> <span className="input-line-pdf w-[80%]" id="pdf-title"></span></td>
          </tr>
          <tr><td colSpan="3" className="section-header">II. Participant's Information</td></tr>
          <tr>
            <td colSpan="2" className="w-[50%]">
              <strong>Name of Personnel:</strong> <span className="input-line-pdf" id="pdf-name"></span><br/><br/>
              <strong>Email Address:</strong> <span className="input-line-pdf" id="pdf-email"></span>
            </td>
            <td><strong>Position Title:</strong> <span className="input-line-pdf w-[95%]" id="pdf-position"></span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
