/* GetSystemInformation
 * Return an object with relivant system information
 */
function getSystemInformation(){
  let output = {};
  output.userAgent = navigator.userAgent;
  let os = navigator.platform;
  switch(os){
    case "Mac68K":
    case "MacPPC":
    case "MacIntel":
    case "Macintosh":
      output.os = "MAC";
      break;
    case "Linux":
    case "Linux aarch64":
    case "Linux armv5tejl":
    case "Linux armv6l":
    case "Linux armv7l":
    case "Linux i686":
    case "Linux i686 on x86_64":
    case "Linux i686 X11":
    case "Linux MSM8960_v3.2.1.1_N_R069_Rev:18":
    case "Linux ppc64":
    case "Linux x86_64":
    case "Linux x86_64 X11":
      output.os = "LINUX";
      break;
    case "OS/2":
    case "Pocket PC":
    case "Windows":
    case "Win16":
    case "Win32":
    case "WinCE":
      output.os = "WINDOWS";
      break;
  }
  return output;
}
