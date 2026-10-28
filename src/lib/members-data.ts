// Données officielles dédoublonnées des membres de la Division Génie Infotronique (GIT)
// Saint Jérôme Polytechnique · Douala
// Source : fiche de cont.txt (99 membres uniques)
import { User, Cotisation, CURRENT_YEAR, DEFAULT_COTISATION_AMOUNT, Role } from './types';

export interface OfficialMember {
  id: string;
  matricule: string;
  fullName: string;
  phone: string;
  email: string;
  promo: string;
}

export const SJP_OFFICIAL_MEMBERS: OfficialMember[] = [
  {
    "id": "sjp_mem_1",
    "matricule": "SJP-GI-001",
    "fullName": "NYABEYEU NYABEYEU L.",
    "phone": "677 38 70 05",
    "email": "nyabeyeu.l@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_2",
    "matricule": "SJP-GI-002",
    "fullName": "MABA NGOUAMEN NANA ADRIENNE",
    "phone": "653 62 91 58",
    "email": "maba.adrienne@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_3",
    "matricule": "SJP-GI-003",
    "fullName": "HAGO KEMENI JUAN",
    "phone": "677 23 86 04",
    "email": "hago.juan@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_4",
    "matricule": "SJP-GI-004",
    "fullName": "ZE EKONO JIESSY KANDY",
    "phone": "688 64 32 45",
    "email": "ze.kandy@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_5",
    "matricule": "SJP-GI-005",
    "fullName": "ESSOMBA SARAH CHRISTIANE",
    "phone": "680 89 67 65",
    "email": "essomba.christiane@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_6",
    "matricule": "SJP-GI-006",
    "fullName": "BOUQUET MARIGOH OMAR",
    "phone": "653 24 51 05",
    "email": "bouquet.omar@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_7",
    "matricule": "SJP-GI-007",
    "fullName": "DIKWA KOLYANG YVAN BRIAN",
    "phone": "688 50 04 14",
    "email": "dikwa.brian@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_8",
    "matricule": "SJP-GI-008",
    "fullName": "WETOA CHRIS",
    "phone": "655 43 60 93",
    "email": "wetoa.chris@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_9",
    "matricule": "SJP-GI-009",
    "fullName": "KOM TAMGOU ADRIEL DARYL",
    "phone": "693 41 33 01",
    "email": "kom.daryl@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_10",
    "matricule": "SJP-GI-010",
    "fullName": "KAOGA KIDMO DEVIN",
    "phone": "698 05 84 97",
    "email": "kaoga.devin@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_11",
    "matricule": "SJP-GI-011",
    "fullName": "AZENE ZAKARIA MOUSSA",
    "phone": "694 07 80 54",
    "email": "azene.moussa@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_12",
    "matricule": "SJP-GI-012",
    "fullName": "KOLA LACMOU MATHIEU JONATHAN",
    "phone": "692 34 85 07",
    "email": "kola.jonathan@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_13",
    "matricule": "SJP-GI-013",
    "fullName": "ZAMBO TAELO CHRISTIAN",
    "phone": "692 05 87 76",
    "email": "zambo.christian@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_14",
    "matricule": "SJP-GI-014",
    "fullName": "YASSA EDOUNG DANIELLA",
    "phone": "672 56 63 54",
    "email": "yassa.daniella@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_15",
    "matricule": "SJP-GI-015",
    "fullName": "Wawo  AKINGNI DAVID",
    "phone": "670 55 68 03",
    "email": "wawo.david@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_16",
    "matricule": "SJP-GI-016",
    "fullName": "CHOMNOU ALANE",
    "phone": "653 14 39 73",
    "email": "chomnou.alane@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_17",
    "matricule": "SJP-GI-017",
    "fullName": "MEDJO ERNESTINE PAULETTE",
    "phone": "696 95 30 45",
    "email": "medjo.paulette@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_18",
    "matricule": "SJP-GI-018",
    "fullName": "NKOULOU SHANE ALEXANDRE",
    "phone": "697 02 01 54",
    "email": "nkoulou.alexandre@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_19",
    "matricule": "SJP-GI-019",
    "fullName": "TOUHOU SIME KEPSEU",
    "phone": "651 23 39 08",
    "email": "touhou.kepseu@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_20",
    "matricule": "SJP-GI-020",
    "fullName": "MARIHADAMA GWLADYS",
    "phone": "696 06 75 38 / 51 72",
    "email": "marihadama.gwladys@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_21",
    "matricule": "SJP-GI-021",
    "fullName": "ASONUGHO SILAS NJENO",
    "phone": "687 39 86 46",
    "email": "asonugho.njeno@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_22",
    "matricule": "SJP-GI-022",
    "fullName": "TEMESSING MBOUYA KENDRA",
    "phone": "641 23 26 60",
    "email": "temessing.kendra@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_23",
    "matricule": "SJP-GI-023",
    "fullName": "Pokam Kenny landry",
    "phone": "659 85 48 53",
    "email": "pokam.landry@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_24",
    "matricule": "SJP-GI-024",
    "fullName": "FOKOU LAHANO STEVE CABREL",
    "phone": "655 67 87 49",
    "email": "fokou.cabrel@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_25",
    "matricule": "SJP-GI-025",
    "fullName": "NZEH MONTUA CHRISTIAN",
    "phone": "657 73 91 45",
    "email": "nzeh.christian@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_26",
    "matricule": "SJP-GI-026",
    "fullName": "KAMGA CHRISTIAN ARTHUR",
    "phone": "(Numéro non renseigné)",
    "email": "kamga.arthur@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_27",
    "matricule": "SJP-GI-027",
    "fullName": "MFORAIN YACOUBA FAISSAL",
    "phone": "686 00 10 78",
    "email": "mforain.faissal@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_28",
    "matricule": "SJP-GI-028",
    "fullName": "NITCHEU PIO DOMINIQUE J.",
    "phone": "686 44 79 61",
    "email": "nitcheu.j@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_29",
    "matricule": "SJP-GI-029",
    "fullName": "BEUCHOP TAMTO STAN ANDY",
    "phone": "688 64 70 94",
    "email": "beuchop.andy@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_30",
    "matricule": "SJP-GI-030",
    "fullName": "DJIEYA DJEUGOUE IVAN",
    "phone": "652 53 53 83",
    "email": "djieya.ivan@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_31",
    "matricule": "SJP-GI-031",
    "fullName": "NJOUME ETCHOME ARNOLD",
    "phone": "683 03 39 64",
    "email": "njoume.arnold@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_32",
    "matricule": "SJP-GI-032",
    "fullName": "NJANTIO MOUTIO ORIANE AUDREY",
    "phone": "679 08 17 72",
    "email": "njantio.audrey@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_33",
    "matricule": "SJP-GI-033",
    "fullName": "NGANNOU TCHATCHUAK KESSY JAMILA",
    "phone": "655 98 38 58",
    "email": "ngannou.jamila@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_34",
    "matricule": "SJP-GI-034",
    "fullName": "MEDJOUOTOU SAMEN MARIE PAULE",
    "phone": "698 09 95 83",
    "email": "medjouotou.paule@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_35",
    "matricule": "SJP-GI-035",
    "fullName": "FAKAM FAKAM JOELLE",
    "phone": "693 82 35 42",
    "email": "fakam.joelle@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_36",
    "matricule": "SJP-GI-036",
    "fullName": "SIMO MAGBOU ZOÉ",
    "phone": "658 16 55 09",
    "email": "simo.zoe@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_37",
    "matricule": "SJP-GI-037",
    "fullName": "TSENZANG NDZANA JULIE",
    "phone": "640 24 44 98",
    "email": "tsenzang.julie@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_38",
    "matricule": "SJP-GI-038",
    "fullName": "MATADMI DANAJA LADY",
    "phone": "695 06 01 95",
    "email": "matadmi.lady@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_39",
    "matricule": "SJP-GI-039",
    "fullName": "ELUNDU ONANA MARIA STELLA",
    "phone": "695 98 95 29",
    "email": "elundu.stella@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_40",
    "matricule": "SJP-GI-040",
    "fullName": "ZE MYA VALERY PRECIOUS",
    "phone": "655 25 56 55",
    "email": "ze.precious@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_41",
    "matricule": "SJP-GI-041",
    "fullName": "ANNE DOLLY MOUTO NGANGUE",
    "phone": "694 86 73 42",
    "email": "anne.ngangue@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_42",
    "matricule": "SJP-GI-042",
    "fullName": "TEULAWO ROSINE BARBARA",
    "phone": "697 54 46 64",
    "email": "teulawo.barbara@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_43",
    "matricule": "SJP-GI-043",
    "fullName": "POY EBOUELÉ MARIE PAULE",
    "phone": "655 97 16 99",
    "email": "poy.paule@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_44",
    "matricule": "SJP-GI-044",
    "fullName": "ATEJIO PRECIOUS N.",
    "phone": "654 26 72 09",
    "email": "atejio.n@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_45",
    "matricule": "SJP-GI-045",
    "fullName": "KUETE HILLARY",
    "phone": "688 18 56 83",
    "email": "kuete.hillary@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_46",
    "matricule": "SJP-GI-046",
    "fullName": "MOHOM MELO CHARLES",
    "phone": "672 21 01 74",
    "email": "mohom.charles@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_47",
    "matricule": "SJP-GI-047",
    "fullName": "SUFFOR TITI MARCEL",
    "phone": "682 33 29 07",
    "email": "suffor.marcel@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_48",
    "matricule": "SJP-GI-048",
    "fullName": "BAKAIWE JUNIOR",
    "phone": "695 26 65 65",
    "email": "bakaiwe.junior@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_49",
    "matricule": "SJP-GI-049",
    "fullName": "NINTCHEU KAMDEM YOHAN",
    "phone": "690 22 84 54",
    "email": "nintcheu.yohan@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_50",
    "matricule": "SJP-GI-050",
    "fullName": "BEGUIDE EMMANUEL DIAM.",
    "phone": "656 16 22 81",
    "email": "beguide.diam@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_51",
    "matricule": "SJP-GI-051",
    "fullName": "DJOUMESSI NDEFO C.",
    "phone": "640 41 24 82",
    "email": "djoumessi.c@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_52",
    "matricule": "SJP-GI-052",
    "fullName": "POKASSA MOUSTAPHA",
    "phone": "687 97 01 21",
    "email": "pokassa.moustapha@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_53",
    "matricule": "SJP-GI-053",
    "fullName": "TCHUNDEmM AMANDA",
    "phone": "(Numéro non renseigné)",
    "email": "tchundemm.amanda@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_54",
    "matricule": "SJP-GI-054",
    "fullName": "EARNEST-IUAN NJOTU",
    "phone": "653 74 58 80",
    "email": "earnestiuan.njotu@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_55",
    "matricule": "SJP-GI-055",
    "fullName": "NTOMB NYECK MANUELA",
    "phone": "(Numéro non renseigné)",
    "email": "ntomb.manuela@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_56",
    "matricule": "SJP-GI-056",
    "fullName": "TIEMOJO DJAMBONG NOE",
    "phone": "682 22 05 76",
    "email": "tiemojo.noe@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_57",
    "matricule": "SJP-GI-057",
    "fullName": "TEKENZEU KENGMO JORDANIS",
    "phone": "696 74 70 33",
    "email": "tekenzeu.jordanis@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_58",
    "matricule": "SJP-GI-058",
    "fullName": "DJUIKO'O JATSA ANGE",
    "phone": "640 13 23 76",
    "email": "djuikoo.ange@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_59",
    "matricule": "SJP-GI-059",
    "fullName": "WOBIVOU RAYAN",
    "phone": "688 89 66 52",
    "email": "wobivou.rayan@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_60",
    "matricule": "SJP-GI-060",
    "fullName": "MUKENGNE GUY ELISEE",
    "phone": "686 62 69 75",
    "email": "mukengne.elisee@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_61",
    "matricule": "SJP-GI-061",
    "fullName": "TCHOUA YANKAM JUDE FUSTEL",
    "phone": "681 55 84 28",
    "email": "tchoua.fustel@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_62",
    "matricule": "SJP-GI-062",
    "fullName": "EDOUA TAMA LEOCADIE",
    "phone": "655 86 87 54",
    "email": "edoua.leocadie@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_63",
    "matricule": "SJP-GI-063",
    "fullName": "PEMENZI MFONZIE PATRICK",
    "phone": "69",
    "email": "pemenzi.patrick@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_64",
    "matricule": "SJP-GI-064",
    "fullName": "Armel Jennifer Djuikui",
    "phone": "(Numéro non renseigné)",
    "email": "armel.djuikui@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_65",
    "matricule": "SJP-GI-065",
    "fullName": "Nguemou Jemima",
    "phone": "(Numéro non renseigné)",
    "email": "nguemou.jemima@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_66",
    "matricule": "SJP-GI-066",
    "fullName": "NJIDJOU RAMSES YANIS",
    "phone": "(Numéro non renseigné)",
    "email": "njidjou.yanis@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_67",
    "matricule": "SJP-GI-067",
    "fullName": "Foche fotso chris jeden",
    "phone": "(Numéro non renseigné)",
    "email": "foche.jeden@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_68",
    "matricule": "SJP-GI-068",
    "fullName": "TCHOUPO NGOKO ASER JORAM",
    "phone": "(Numéro non renseigné)",
    "email": "tchoupo.joram@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_69",
    "matricule": "SJP-GI-069",
    "fullName": "Issepini Emok Jahdonne",
    "phone": "(Numéro non renseigné)",
    "email": "issepini.jahdonne@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_70",
    "matricule": "SJP-GI-070",
    "fullName": "NANA NTEUGA ESPÉRANCE",
    "phone": "(Numéro non renseigné)",
    "email": "nana.esperance@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_71",
    "matricule": "SJP-GI-071",
    "fullName": "Mawadjou Youmbou dokass Danielle",
    "phone": "(Numéro non renseigné)",
    "email": "mawadjou.danielle@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_72",
    "matricule": "SJP-GI-072",
    "fullName": "Kilegel Grâce Godwin Anne",
    "phone": "(Numéro non renseigné)",
    "email": "kilegel.anne@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_73",
    "matricule": "SJP-GI-073",
    "fullName": "ESTELLE MEIKENG DUCHESSE K",
    "phone": "(Numéro non renseigné)",
    "email": "estelle.k@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_74",
    "matricule": "SJP-GI-074",
    "fullName": "Mintsa fopa Ulrich Paul",
    "phone": "(Numéro non renseigné)",
    "email": "mintsa.paul@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_75",
    "matricule": "SJP-GI-075",
    "fullName": "YAMDJEU FENYIEP ELVIRA",
    "phone": "(Numéro non renseigné)",
    "email": "yamdjeu.elvira@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_76",
    "matricule": "SJP-GI-076",
    "fullName": "DIYANI GOUETH CLARA TINY KELIANE",
    "phone": "(Numéro non renseigné)",
    "email": "diyani.keliane@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_77",
    "matricule": "SJP-GI-077",
    "fullName": "Ndzie Ariane Monika",
    "phone": "(Numéro non renseigné)",
    "email": "ndzie.monika@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_78",
    "matricule": "SJP-GI-078",
    "fullName": "Demlabim Lonto Lesly",
    "phone": "(Numéro non renseigné)",
    "email": "demlabim.lesly@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_79",
    "matricule": "SJP-GI-079",
    "fullName": "Ntadah Dzonteu Yvan brandon",
    "phone": "(Numéro non renseigné)",
    "email": "ntadah.brandon@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_80",
    "matricule": "SJP-GI-080",
    "fullName": "MOUNYICHE ABDALLAH WAHAB",
    "phone": "(Numéro non renseigné)",
    "email": "mounyiche.wahab@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_81",
    "matricule": "SJP-GI-081",
    "fullName": "KOUOH ETEKY AIME FREDY",
    "phone": "(Numéro non renseigné)",
    "email": "kouoh.fredy@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_82",
    "matricule": "SJP-GI-082",
    "fullName": "Meli Fonkeng Tidianie Palmer",
    "phone": "(Numéro non renseigné)",
    "email": "meli.palmer@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_83",
    "matricule": "SJP-GI-083",
    "fullName": "Tomedi Malike Diange Ilona",
    "phone": "(Numéro non renseigné)",
    "email": "tomedi.ilona@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_84",
    "matricule": "SJP-GI-084",
    "fullName": "SEUMO MAMNO CHRISTAGIE OURIELLE",
    "phone": "(Numéro non renseigné)",
    "email": "seumo.ourielle@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_85",
    "matricule": "SJP-GI-085",
    "fullName": "EYIDI DISSAKE HIOES CHRIST",
    "phone": "(Numéro non renseigné)",
    "email": "eyidi.christ@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_86",
    "matricule": "SJP-GI-086",
    "fullName": "Sami Nana Charlotte",
    "phone": "(Numéro non renseigné)",
    "email": "sami.charlotte@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_87",
    "matricule": "SJP-GI-087",
    "fullName": "NGUIMNANG DJEUTCHEU GRACE MAELIE",
    "phone": "(Numéro non renseigné)",
    "email": "nguimnang.maelie@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_88",
    "matricule": "SJP-GI-088",
    "fullName": "Mouhamadou Awal Ahamadou",
    "phone": "(Numéro non renseigné)",
    "email": "mouhamadou.ahamadou@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_89",
    "matricule": "SJP-GI-089",
    "fullName": "KAMDEM PEKAM CELESTE ANDREA",
    "phone": "(Numéro non renseigné)",
    "email": "kamdem.andrea@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_90",
    "matricule": "SJP-GI-090",
    "fullName": "Noubeyo Jean Célestin",
    "phone": "(Numéro non renseigné)",
    "email": "noubeyo.celestin@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_91",
    "matricule": "SJP-GI-091",
    "fullName": "TAMOKOUE FOMO DANIEL ULRICH",
    "phone": "(Numéro non renseigné)",
    "email": "tamokoue.ulrich@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_92",
    "matricule": "SJP-GI-092",
    "fullName": "Owotsogo Essama Joseph Manuel",
    "phone": "(Numéro non renseigné)",
    "email": "owotsogo.manuel@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_93",
    "matricule": "SJP-GI-093",
    "fullName": "Mandeng Cédric Lionel",
    "phone": "(Numéro non renseigné)",
    "email": "mandeng.lionel@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_94",
    "matricule": "SJP-GI-094",
    "fullName": "NDZANA DOMINIQUE",
    "phone": "(Numéro non renseigné)",
    "email": "ndzana.dominique@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_95",
    "matricule": "SJP-GI-095",
    "fullName": "NGANI DAKAM ARIEL CHRISTINE",
    "phone": "(Numéro non renseigné)",
    "email": "ngani.christine@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_96",
    "matricule": "SJP-GI-096",
    "fullName": "KHADIDJA ALIYA GHANIA",
    "phone": "(Numéro non renseigné)",
    "email": "khadidja.ghania@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_97",
    "matricule": "SJP-GI-097",
    "fullName": "TCHOFFO TAGNIZEU BRANDON JUNIOR",
    "phone": "(Numéro non renseigné)",
    "email": "tchoffo.junior@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_98",
    "matricule": "SJP-GI-098",
    "fullName": "DIMOUYAH DAMA DANIELA JOYCE",
    "phone": "(Numéro non renseigné)",
    "email": "dimouyah.joyce@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  },
  {
    "id": "sjp_mem_99",
    "matricule": "SJP-GI-099",
    "fullName": "Zouossia fouojegouo ange cherone",
    "phone": "(Numéro non renseigné)",
    "email": "zouossia.cherone@saintjerome.cm",
    "promo": "Élève-Ingénieur GI"
  }
];

export function splitFullName(fullName: string): { nom: string; prenom: string } {
  const cleaned = fullName.trim().replace(/\s+/g, ' ');
  const words = cleaned.split(' ');
  if (words.length <= 1) {
    return { nom: cleaned.toUpperCase(), prenom: '-' };
  }
  // Si le dernier mot est une initiale comme "L." ou "J."
  if (words[words.length - 1].length <= 2) {
    return {
      nom: words.slice(0, words.length - 1).join(' ').toUpperCase(),
      prenom: words[words.length - 1],
    };
  }
  // Détection des mots en majuscules (noms de famille) vs minuscules/capitalisées (prénoms)
  const uppercaseWords = words.filter((w) => w === w.toUpperCase() && /[A-Z]/.test(w) && w.length > 1);
  if (uppercaseWords.length > 0 && uppercaseWords.length < words.length) {
    const nomWords = words.filter((w) => w === w.toUpperCase() && /[A-Z]/.test(w) && w.length > 1);
    const prenomWords = words.filter((w) => !(w === w.toUpperCase() && /[A-Z]/.test(w) && w.length > 1));
    return {
      nom: nomWords.join(' ').toUpperCase(),
      prenom: prenomWords.join(' '),
    };
  }

  // Découpage conventionnel : dernier token = prénom, tokens précédents = nom
  const prenom = words[words.length - 1];
  const nom = words.slice(0, words.length - 1).join(' ').toUpperCase();
  return { nom, prenom };
}

export function generateOfficialUsers(): User[] {
  return SJP_OFFICIAL_MEMBERS.map((m, index) => {
    const { nom, prenom } = splitFullName(m.fullName);
    const userId = `usr_sjp_${String(index + 1).padStart(3, '0')}`;
    const initialCotisations: Cotisation[] = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((mois) => ({
      id: `cot_${userId}_${mois}`,
      mois,
      annee: CURRENT_YEAR,
      montant: DEFAULT_COTISATION_AMOUNT,
      isPaid: false,
      userId,
    }));

    return {
      id: userId,
      matricule: m.matricule,
      nom,
      prenom,
      email: m.email,
      phone: m.phone === '(Numéro non renseigné)' ? '' : m.phone,
      niveau: 'GI_4',
      role: 'MEMBER' as const,
      isActive: true,
      mustChangePassword: true, // Requis: Modifiable à la 1ère connexion
      password: 'git2026',       // Mot de passe initial par défaut
      qrCodeToken: `token_sjp_${m.matricule.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      isWifiAllowed: false,
      isLabAllowed: true,
      macAddresses: [],
      cotisations: initialCotisations,
      penalties: [],
      certifications: [],
      passwordResetRequested: false,
      createdAt: '2026-10-21T08:00:00.000Z',
      updatedAt: '2026-10-21T08:00:00.000Z',
    };
  });
}

// ============================================================
// MEMBRES OFFICIELS DU BUREAU EXÉCUTIF GIT
// Source : MEMEBRE DU BUREAU.txt (16 membres avec postes officiels)
// ============================================================
export interface BureauMemberOfficial {
  id: string;
  matricule: string;
  poste: string;
  nom: string;
  prenom: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  pole: number; // 1: Haute Direction, 2: Titulaires Exécutifs, 3: Adjoints Exécutifs
}

export const SJP_BUREAU_MEMBERS: BureauMemberOfficial[] = [
  {
    id: "bur_01",
    matricule: "GIT-BUR-01",
    poste: "Président de la Division",
    nom: "KPWANDA",
    prenom: "Yvan",
    fullName: "KPWANDA Yvan",
    email: "kpwanda.yvan@saintjerome.cm",
    phone: "677 00 00 01",
    role: "ADMIN",
    pole: 1
  },
  {
    id: "bur_02",
    matricule: "GIT-BUR-02",
    poste: "Vice-Président",
    nom: "MOUNYICHE ABDALLAH",
    prenom: "Wahab",
    fullName: "MOUNYICHE ABDALLAH Wahab",
    email: "abdallah.wahab@saintjerome.cm",
    phone: "677 00 00 02",
    role: "ADMIN",
    pole: 1
  },
  {
    id: "bur_03",
    matricule: "GIT-BUR-03",
    poste: "Secrétaire Générale",
    nom: "MAWADJOU YOUMBOU",
    prenom: "Dokass Danielle",
    fullName: "MAWADJOU Dokass Danielle",
    email: "mawadjou.dokass@saintjerome.cm",
    phone: "677 00 00 03",
    role: "ADMIN",
    pole: 2
  },
  {
    id: "bur_04",
    matricule: "GIT-BUR-04",
    poste: "Censeur Principal (Scan & Contrôle)",
    nom: "SIGNE",
    prenom: "Astrid",
    fullName: "SIGNE Astrid",
    email: "signe.astrid@saintjerome.cm",
    phone: "677 00 00 04",
    role: "CENSEUR",
    pole: 2
  },
  {
    id: "bur_05",
    matricule: "GIT-BUR-05",
    poste: "Commissaire aux Comptes",
    nom: "MIMCHE",
    prenom: "Marouf",
    fullName: "MIMCHE Marouf",
    email: "mimche.marouf@saintjerome.cm",
    phone: "677 00 00 05",
    role: "TREASURER",
    pole: 2
  },
  {
    id: "bur_06",
    matricule: "GIT-BUR-06",
    poste: "Trésorière Générale",
    nom: "EBODE",
    prenom: "Erika",
    fullName: "EBODE Erika",
    email: "ebode.erika@saintjerome.cm",
    phone: "677 00 00 06",
    role: "TREASURER",
    pole: 2
  },
  {
    id: "bur_07",
    matricule: "GIT-BUR-07",
    poste: "Responsable du Laboratoire & Réseau",
    nom: "NYATCHOU",
    prenom: "Junior",
    fullName: "NYATCHOU Junior",
    email: "nyatchou.junior@saintjerome.cm",
    phone: "677 00 00 07",
    role: "LAB_MANAGER",
    pole: 2
  },
  {
    id: "bur_08",
    matricule: "GIT-BUR-08",
    poste: "Responsable Communication & Événementielle",
    nom: "NGEUMOU",
    prenom: "Jemima",
    fullName: "NGEUMOU Jemima",
    email: "ngeumou.jemima@saintjerome.cm",
    phone: "677 00 00 08",
    role: "COMMUNICATION",
    pole: 2
  },
  {
    id: "bur_09",
    matricule: "GIT-BUR-09",
    poste: "Responsable Formation & Projets R&D",
    nom: "MBIAKOP",
    prenom: "Junior",
    fullName: "MBIAKOP Junior",
    email: "mbiakop.junior@saintjerome.cm",
    phone: "677 00 00 09",
    role: "FORMATION",
    pole: 2
  },
  {
    id: "bur_10",
    matricule: "GIT-BUR-10",
    poste: "Conseiller Spécial 1",
    nom: "NJOUME ETEH",
    prenom: "Claude Arsène",
    fullName: "NJOUME ETEH Claude Arsène",
    email: "njoume.claude@saintjerome.cm",
    phone: "677 00 00 10",
    role: "CONSEILLER",
    pole: 1
  },
  {
    id: "bur_11",
    matricule: "GIT-BUR-11",
    poste: "Conseiller Spécial 2",
    nom: "MAPOURE",
    prenom: "Davelton",
    fullName: "MAPOURE Davelton",
    email: "mapoure.davelton@saintjerome.cm",
    phone: "677 00 00 11",
    role: "CONSEILLER",
    pole: 1
  },
  {
    id: "bur_12",
    matricule: "GIT-BUR-12",
    poste: "Conseiller Spécial 3",
    nom: "SEMPEY",
    prenom: "Pierre Lionel",
    fullName: "SEMPEY Pierre Lionel",
    email: "sempey.lionel@saintjerome.cm",
    phone: "677 00 00 12",
    role: "CONSEILLER",
    pole: 1
  },
  {
    id: "bur_13",
    matricule: "GIT-BUR-13",
    poste: "Resp. Formation & Projets Adjoint",
    nom: "MPOPO",
    prenom: "Antoinne",
    fullName: "MPOPO Antoinne",
    email: "mpopo.antoinne@saintjerome.cm",
    phone: "677 00 00 13",
    role: "FORMATION",
    pole: 3
  },
  {
    id: "bur_14",
    matricule: "GIT-BUR-14",
    poste: "Resp. Communication & Événementielle Adjoint",
    nom: "POKASSA",
    prenom: "Moustapha",
    fullName: "POKASSA Moustapha",
    email: "pokassa.moustapha@saintjerome.cm",
    phone: "687 97 01 21",
    role: "COMMUNICATION",
    pole: 3
  },
  {
    id: "bur_15",
    matricule: "GIT-BUR-15",
    poste: "Censeur Adjoint (Contrôle d'accès)",
    nom: "NOUBEYO",
    prenom: "Jean Célestin",
    fullName: "NOUBEYO Jean Célestin",
    email: "noubeyo.celestin@saintjerome.cm",
    phone: "677 00 00 15",
    role: "CENSEUR",
    pole: 3
  },
  {
    id: "bur_16",
    matricule: "GIT-BUR-16",
    poste: "Secrétaire Générale Adjointe",
    nom: "ARMEL",
    prenom: "Jennifer",
    fullName: "ARMEL Jennifer",
    email: "armel.jennifer@saintjerome.cm",
    phone: "677 00 00 16",
    role: "ADMIN",
    pole: 3
  },
  {
    id: "bur_17",
    matricule: "GIT-BUR-17",
    poste: "Community Manager & Responsable Galerie",
    nom: "KOUOH ETEKI",
    prenom: "Freddy",
    fullName: "KOUOH ETEKI Freddy",
    email: "kouoh.fredy@saintjerome.cm",
    phone: "677 00 00 17",
    role: "COMMUNITY_MANAGER",
    pole: 2
  }
];

export function generateBureauUsers(): User[] {
  return SJP_BUREAU_MEMBERS.map((bm) => {
    return {
      id: `usr_${bm.matricule.toLowerCase().replace(/-/g, '_')}`,
      matricule: bm.matricule,
      nom: bm.nom,
      prenom: bm.prenom,
      email: bm.email,
      phone: bm.phone || '',
      niveau: 'GI_Bureau',
      role: bm.role,
      poste: bm.poste,
      isActive: true,
      mustChangePassword: true, // EXIGENCE : changeable à première connexion
      password: 'git2026',       // Mot de passe initial par défaut
      qrCodeToken: `token_bureau_${bm.matricule.toLowerCase()}`,
      isWifiAllowed: true,
      isLabAllowed: true,
      macAddresses: [],
      cotisations: [],
      penalties: [],
      certifications: [],
      passwordResetRequested: false,
      createdAt: '2026-10-22T08:00:00.000Z',
      updatedAt: '2026-10-22T08:00:00.000Z',
    };
  });
}
