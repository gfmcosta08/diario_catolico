import json
import re
import unicodedata
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(r'D:\opencode\Agenda Catolica\agenda-catolica')
DATA_TS = ROOT / 'data' / 'readingPlanData.ts'
OUT_TS = ROOT / 'data' / 'readingPlanPublicDomainData.ts'
SOURCE_URL = 'https://archive.org/download/bibliasagradacon00figu/bibliasagradacon00figu_djvu.txt'

BOOK_TOKEN_MAP = {
    'Gênesis': 'GENESIS', 'Êxodo': 'EXODO', 'Levítico': 'LEVITICO', 'Números': 'NUMEROS', 'Deuteronômio': 'DEUTERONOMIO',
    'Josué': 'JOSUE', 'Juízes': 'JUIZES', 'Rute': 'RUTH', '1 Samuel': 'I DOS REIS', '2 Samuel': 'II DOS REIS',
    '1 Reis': 'III DOS REIS', '2 Reis': 'IV DOS REIS', '1 Crônicas': 'I DOS PARALIPOMENOS', '2 Crônicas': 'II DOS PARALIPOMENOS',
    'Esdras': 'I DE ESDRAS', 'Neemias': 'II DE ESDRAS', 'Tobias': 'TOBIAS', 'Judite': 'JUDITH', 'Ester': 'ESTHER',
    'Jó': 'JOB', 'Salmos': 'PSALMO', 'Provérbios': 'PROVERBIOS', 'Eclesiastes': 'ECCLESIASTES', 'Cântico dos Cânticos': 'CANTICO DOS CANTICOS',
    'Sabedoria': 'SABEDORIA', 'Eclesiástico': 'ECCLESIASTICO', 'Isaías': 'ISAIAS', 'Jeremias': 'JEREMIAS', 'Lamentações': 'LAMENTACO',
    'Baruc': 'BARUCH', 'Ezequiel': 'EZECHIEL', 'Daniel': 'DANIEL', 'Oseias': 'OSEAS', 'Joel': 'JOEL', 'Amós': 'AMOS',
    'Abdias': 'ABDIAS', 'Jonas': 'JONAS', 'Miqueias': 'MICHEAS', 'Naum': 'NAHUM', 'Habacuc': 'HABACUC', 'Sofonias': 'SOPHONIAS',
    'Ageu': 'AGGEO', 'Zacarias': 'ZACHARIAS', 'Malaquias': 'MALACHIAS', '1 Macabeus': 'I DOS MACABEOS', '2 Macabeus': 'II DOS MACABEOS',
    'Mateus': 'MATTHEUS', 'Marcos': 'MARCOS', 'Lucas': 'LUCAS', 'João': 'JOAO', 'Atos': 'ACTOS', 'Romanos': 'ROMANOS',
    '1 Coríntios': 'I AOS CORINTHIOS', '2 Coríntios': 'II AOS CORINTHIOS', 'Gálatas': 'AOS GALATAS', 'Efésios': 'AOS EPHESIOS',
    'Filipenses': 'AOS PHILIPPENSES', 'Colossenses': 'AOS COLOSSENSES', '1 Tessalonicenses': 'I AOS THESSALONICENSES',
    '2 Tessalonicenses': 'II AOS THESSALONICENSES', '1 Timóteo': 'I A TIMOTHEO', '2 Timóteo': 'II A TIMOTHEO',
    'Tito': 'A TITO', 'Filemom': 'A PHILEMON', 'Hebreus': 'HEBREOS', 'Tiago': 'TIAGO', '1 Pedro': 'I DE S PEDRO',
    '2 Pedro': 'II DE S PEDRO', '1 João': 'I DE S JOAO', '2 João': 'II DE S JOAO', '3 João': 'III DE S JOAO',
    'Judas': 'JUDAS', 'Apocalipse': 'APOCALYPSE'
}

ROMAN = {
    'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10,'XI':11,'XII':12,'XIII':13,'XIV':14,'XV':15,'XVI':16,
    'XVII':17,'XVIII':18,'XIX':19,'XX':20,'XXI':21,'XXII':22,'XXIII':23,'XXIV':24,'XXV':25,'XXVI':26,'XXVII':27,'XXVIII':28,
    'XXIX':29,'XXX':30,'XXXI':31,'XXXII':32,'XXXIII':33,'XXXIV':34,'XXXV':35,'XXXVI':36,'XXXVII':37,'XXXVIII':38,'XXXIX':39,'XL':40,
    'XLI':41,'XLII':42,'XLIII':43,'XLIV':44,'XLV':45,'XLVI':46,'XLVII':47,'XLVIII':48,'XLIX':49,'L':50,'LI':51,'LII':52,'LIII':53,
    'LIV':54,'LV':55,'LVI':56,'LVII':57,'LVIII':58,'LIX':59,'LX':60,'LXI':61,'LXII':62,'LXIII':63,'LXIV':64,'LXV':65,'LXVI':66,
    'LXVII':67,'LXVIII':68,'LXIX':69,'LXX':70,'LXXI':71,'LXXII':72,'LXXIII':73,'LXXIV':74,'LXXV':75,'LXXVI':76,'LXXVII':77,'LXXVIII':78,
    'LXXIX':79,'LXXX':80,'LXXXI':81,'LXXXII':82,'LXXXIII':83,'LXXXIV':84,'LXXXV':85,'LXXXVI':86,'LXXXVII':87,'LXXXVIII':88,'LXXXIX':89,
    'XC':90,'XCI':91,'XCII':92,'XCIII':93,'XCIV':94,'XCV':95,'XCVI':96,'XCVII':97,'XCVIII':98,'XCIX':99,'C':100,'CI':101,'CII':102,
    'CIII':103,'CIV':104,'CV':105,'CVI':106,'CVII':107,'CVIII':108,'CIX':109,'CX':110,'CXI':111,'CXII':112,'CXIII':113,'CXIV':114,
    'CXV':115,'CXVI':116,'CXVII':117,'CXVIII':118,'CXIX':119,'CXX':120,'CXXI':121,'CXXII':122,'CXXIII':123,'CXXIV':124,'CXXV':125,
    'CXXVI':126,'CXXVII':127,'CXXVIII':128,'CXXIX':129,'CXXX':130,'CXXXI':131,'CXXXII':132,'CXXXIII':133,'CXXXIV':134,'CXXXV':135,
    'CXXXVI':136,'CXXXVII':137,'CXXXVIII':138,'CXXXIX':139,'CXL':140,'CXLI':141,'CXLII':142,'CXLIII':143,'CXLIV':144,'CXLV':145,
    'CXLVI':146,'CXLVII':147,'CXLVIII':148,'CXLIX':149,'CL':150
}

def normalize(s: str) -> str:
    s = ''.join(c for c in unicodedata.normalize('NFKD', s.upper()) if not unicodedata.combining(c))
    s = re.sub(r'[^A-Z0-9\n ]+', ' ', s)
    s = re.sub(r' +', ' ', s)
    return s


def parse_plan_data():
    s = DATA_TS.read_text(encoding='utf-8')
    m = re.search(r'READING_PLAN_DATA\s*:\s*ReadingPlanData\[\]\s*=\s*(\[[\s\S]*\])\s*as const;', s)
    if not m:
        m = re.search(r'READING_PLAN_DATA\s*=\s*(\[[\s\S]*\])\s*as const;', s)
    return json.loads(m.group(1))


def split_ref(ref: str):
    m = re.match(r'^((?:[1-4]\s+)?[A-Za-zÀ-ÿçÇ\s]+?)\s+(\d[\d:\-–\s]*)$', ref.strip())
    if not m:
        return None, None
    return m.group(1).strip(), m.group(2).strip().replace('–', '-')


def parse_spec(spec: str):
    if ':' not in spec:
        if '-' in spec:
            a,b=[int(x.strip()) for x in spec.split('-',1)]
            return ('chapters',a,b)
        n=int(spec)
        return ('chapters',n,n)
    if '-' in spec:
        left,right=[x.strip() for x in spec.split('-',1)]
        if ':' in right:
            c1,v1=[int(x.strip()) for x in left.split(':',1)]
            c2,v2=[int(x.strip()) for x in right.split(':',1)]
            return ('cross_verses',c1,v1,c2,v2)
        c,v1=[int(x.strip()) for x in left.split(':',1)]
        v2=int(right)
        return ('verses',c,v1,v2)
    c,v=[int(x.strip()) for x in spec.split(':',1)]
    return ('verses',c,v,v)


def find_all(hay, needle):
    out=[]; i=0
    while True:
        i=hay.find(needle, i)
        if i==-1: break
        out.append(i)
        i+=1
    return out


def build_book_ranges(source, ordered_books):
    nsource=normalize(source)
    ranges={}
    cur=0
    for book in ordered_books:
        token=BOOK_TOKEN_MAP.get(book)
        if not token:
            continue
        needle=normalize(token)
        hits=[h for h in find_all(nsource, needle) if h>10000]
        chosen=None
        for h in hits:
            if h>=cur and 'CAPITULO I' in nsource[h:h+3200]:
                chosen=h
                break
        if chosen is None and hits:
            chosen=hits[0]
        if chosen is not None:
            ranges[book]=[chosen,len(source)]
            cur=chosen

    ordered=sorted(ranges.items(), key=lambda kv: kv[1][0])
    for i,(book,(start,_)) in enumerate(ordered):
        end=ordered[i+1][1][0] if i+1<len(ordered) else len(source)
        ranges[book]=[start,end]
    return ranges


def split_chapters(book_text):
    nbook=normalize(book_text)
    matches=list(re.finditer(r'CAPITULO\s+([IVXLCDM]{1,8})\b', nbook))
    out={}
    for i,m in enumerate(matches):
        num=ROMAN.get(m.group(1))
        if not num:
            continue
        start=m.start(); end=matches[i+1].start() if i+1<len(matches) else len(book_text)
        out[num]=book_text[start:end]
    return out


def extract_verses(chapter_text):
    out={}; cur=None; buf=[]
    for line in chapter_text.splitlines():
        m=re.match(r'^\s*(\d{1,3})\s+(.*)$', line)
        if m:
            if cur is not None:
                out[cur]='\n'.join(buf).strip()
            cur=int(m.group(1)); buf=[m.group(0).strip()]
        elif cur is not None:
            buf.append(line.rstrip())
    if cur is not None:
        out[cur]='\n'.join(buf).strip()
    return out


def normalize_ws(s):
    s=s.replace('\xa0',' ')
    s=re.sub(r'\n{3,}','\n\n',s)
    return s.strip()

def fix_mojibake(s: str) -> str:
    candidate = s
    for _ in range(2):
        if 'Ã' not in candidate and 'Â' not in candidate:
            break
        try:
            candidate = candidate.encode('latin-1', errors='ignore').decode('utf-8', errors='ignore')
        except Exception:
            break
    return candidate


def extract_ref(book, ref, chapters_map):
    _,spec=split_ref(ref)
    if not spec:
        return None
    mode=parse_spec(spec)

    if mode[0]=='chapters':
        _,a,b=mode
        chunks=[]
        for c in range(a,b+1):
            t=chapters_map.get(c)
            if not t:
                return None
            chunks.append(normalize_ws(t))
        return fix_mojibake(f'{book} {spec}\n\n'+'\n\n'.join(chunks))

    if mode[0]=='verses':
        _,c,v1,v2=mode
        t=chapters_map.get(c)
        if not t:
            return None
        vmap=extract_verses(t)
        selected=[vmap[v] for v in range(v1,v2+1) if v in vmap]
        if not selected:
            return None
        return fix_mojibake(f'{book} {spec}\n\n'+'\n\n'.join(selected))

    if mode[0]=='cross_verses':
        _,c1,v1,c2,v2=mode
        chunks=[]
        for c in range(c1,c2+1):
            t=chapters_map.get(c)
            if not t:
                return None
            vmap=extract_verses(t)
            if not vmap:
                return None
            lo=v1 if c==c1 else min(vmap.keys())
            hi=v2 if c==c2 else max(vmap.keys())
            part=[vmap[v] for v in range(lo,hi+1) if v in vmap]
            if not part:
                return None
            chunks.extend(part)
        return fix_mojibake(f'{book} {spec}\n\n'+'\n\n'.join(chunks))

    return None


def main():
    plan=parse_plan_data()
    ordered_books=[]
    for day in plan:
        for ref in day['references']:
            b,_=split_ref(ref)
            if b and b not in ordered_books:
                ordered_books.append(b)

    req=Request(SOURCE_URL, headers={'User-Agent':'Mozilla/5.0'})
    with urlopen(req, timeout=120) as r:
        raw = r.read()
        try:
            source = raw.decode('latin-1')
        except Exception:
            source = raw.decode('utf-8', errors='replace')

    ranges=build_book_ranges(source, ordered_books)
    chapters_by_book={}
    for b,(s,e) in ranges.items():
        chapters_by_book[b]=split_chapters(source[s:e])

    result={}
    total_refs=0; covered_refs=0

    for day in plan:
        extracted=[]
        covered=[]
        missing=[]
        for ref in day['references']:
            total_refs += 1
            book,_=split_ref(ref)
            cmap=chapters_by_book.get(book)
            if not cmap:
                missing.append(ref)
                continue
            txt=extract_ref(book, ref, cmap)
            if txt:
                covered.append(ref)
                covered_refs += 1
                extracted.append(txt)
            else:
                missing.append(ref)

        if covered:
            result[str(day['day'])]={
                'body': '\n\n\n'.join(extracted).strip(),
                'coveredReferences': covered,
                'missingReferences': missing,
                'coverage': round(len(covered)/len(day['references']), 4)
            }

    ts = "export type PublicDomainDay = {\n" \
         "  body: string;\n" \
         "  coveredReferences: string[];\n" \
         "  missingReferences: string[];\n" \
         "  coverage: number;\n" \
         "};\n\n" \
         "export const PUBLIC_DOMAIN_SOURCE = {\n" \
         "  name: 'Biblia Sagrada (Antonio Pereira de Figueiredo, 1866, OCR)',\n" \
         "  url: 'https://archive.org/details/bibliasagradacon00figu',\n" \
         "  license: 'Dominio publico (edicao historica)',\n" \
         "} as const;\n\n" \
         "export const READING_PLAN_PUBLIC_DOMAIN_DATA: Record<number, PublicDomainDay> = " + json.dumps({int(k):v for k,v in result.items()}, ensure_ascii=False, indent=2) + " as const;\n"

    OUT_TS.write_text(ts, encoding='utf-8')
    print('generated', OUT_TS)
    print('days_with_any_content', len(result))
    print('covered_refs', covered_refs)
    print('total_refs', total_refs)
    print('coverage_ratio', round(covered_refs/total_refs,4) if total_refs else 0)

if __name__=='__main__':
    main()
