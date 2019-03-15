export *  from './emv-cert-decoder';
//import * as forge from "node-forge";
//import * as $ from 'jquery';

/*function decodeCert(issuerCert: string, rid: string, pkidx: string ) {
  let remainder = "";

  try {
    let cert = H2B(issuerCert);

    let decoded = new EMVCertificateDecoder().decodeIssuerCertificate(H2B(rid), parseInt( pkidx,16), cert);

    let decodedHex:any = {};
    for( let m in decoded ) {
      decodedHex[m] = forge.util.bytesToHex( decoded[m] );
    }

    $( '#decode' ).text( JSON.stringify(decodedHex, null, 2 ) );
  }
  catch( e ) {
    $( '#decode' ).text( e );
  }

  (window  as any)["decodeCert"]= decodeCert;
}

function updateCertFromForm( cert: string ) {
  let rid = $('#rid').val() as string;
  let pkidx = $('#pkindex').val() as string;

  if ( !cert )
    cert = splitCert($('#cert').val() as string)["90"];

  decodeCert( cert, rid, pkidx );
}

function splitCert( issuerCert: string ): Hash {
  let ret: Hash = {};

  if ( issuerCert.indexOf("0090")>=0) {
    let ctvs = parseCTV( issuerCert );

    ret["90"] = ctvs["0090"];
    if ( ctvs["008F"] )
      ret["8F"] = ctvs["008F"];
    if ( ctvs["0084"] )
      ret["84"] = ctvs["0084"];
    if ( ctvs["0092"] )
      ret["92"] = ctvs["0092"];
  }
  else if ( issuerCert.startsWith("9081")) {
    ret = parseTLV( issuerCert );
  }
  else {
    ret["90"] = issuerCert;
  }

  return ret;
}

$(document).ready(() => {
  $('#cert').on('input', (event) => {
    let cert = ($(event.currentTarget).val() as String)
      .toUpperCase()
      .replace( /[ \s]/g,'');

    let certHash = splitCert( cert );

    if ( certHash["84"] )
      $("#rid").val( certHash["84"].substr(0,10) );
    if ( certHash["8F"] )
      $("#pkindex").val( certHash["8F"] );

    updateCertFromForm( certHash["90"]);
  } );
});
*/
