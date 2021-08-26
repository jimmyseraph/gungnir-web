const FLOW_CONTROL_KEYWORDS = "break continue do else for if return while ";

const C_KEYWORDS = FLOW_CONTROL_KEYWORDS + "auto case char const default " +
    "double enum extern float goto int long register short signed sizeof " +
    "static struct switch typedef union unsigned void volatile ";

const COMMON_KEYWORDS = C_KEYWORDS + "catch class delete false import " +
    "new operator private protected public this throw true try typeof ";

const CPP_KEYWORDS = COMMON_KEYWORDS + "alignof align_union asm axiom bool " +
    "concept concept_map const_cast constexpr decltype " +
    "dynamic_cast explicit export friend inline late_check " +
    "mutable namespace nullptr reinterpret_cast static_assert static_cast " +
    "template typeid typename using virtual wchar_t where ";

const JAVA_KEYWORDS = COMMON_KEYWORDS +
    "abstract boolean byte extends final finally implements import " +
    "instanceof null native package strictfp super synchronized throws " +
    "transient ";

const CSHARP_KEYWORDS = JAVA_KEYWORDS +
    "as base by checked decimal delegate descending event " +
    "fixed foreach from group implicit in interface internal into is lock " +
    "object out override orderby params partial readonly ref sbyte sealed " +
    "stackalloc string select uint ulong unchecked unsafe ushort var ";

const JSCRIPT_KEYWORDS = COMMON_KEYWORDS +
    "debugger eval export function get null set undefined var with " +
    "Infinity NaN ";

const PERL_KEYWORDS = "caller delete die do dump elsif eval exit foreach for " +
    "goto if import last local my next no our print package redo require " +
    "sub undef unless until use wantarray while BEGIN END ";

const PYTHON_KEYWORDS = FLOW_CONTROL_KEYWORDS + "and as assert class def del " +
    "elif except exec finally from global import in is lambda " +
    "nonlocal not or pass print raise try with yield " +
    "False True None ";

const RUBY_KEYWORDS = FLOW_CONTROL_KEYWORDS + "alias and begin case class def" +
    " defined elsif end ensure false in module next nil not or redo rescue " +
    "retry self super then true undef unless until when yield BEGIN END ";

const SH_KEYWORDS = FLOW_CONTROL_KEYWORDS + "case done elif esac eval fi " +
    "function in local set then until ";

const ALL_KEYWORDS = (
    CPP_KEYWORDS + CSHARP_KEYWORDS + JSCRIPT_KEYWORDS + PERL_KEYWORDS +
    PYTHON_KEYWORDS + RUBY_KEYWORDS + SH_KEYWORDS);

// token style names.  correspond to css classes
/** token style for a string literal */
const PR_STRING = 'str';
/** token style for a keyword */
const PR_KEYWORD = 'kwd';
/** token style for a comment */
const PR_COMMENT = 'com';
/** token style for a type */
const PR_TYPE = 'typ';
/** token style for a literal value.  e.g. 1, null, true. */
const PR_LITERAL = 'lit';
/** token style for a punctuation string. */
const PR_PUNCTUATION = 'pun';
/** token style for a punctuation string. */
const PR_PLAIN = 'pln';

/** token style for an sgml tag. */
const PR_TAG = 'tag';
/** token style for a markup declaration such as a DOCTYPE. */
const PR_DECLARATION = 'dec';
/** token style for embedded source. */
const PR_SOURCE = 'src';
/** token style for an sgml attribute name. */
const PR_ATTRIB_NAME = 'atn';
/** token style for an sgml attribute value. */
const PR_ATTRIB_VALUE = 'atv';

/**
 * A class that indicates a section of markup that is not code, e.g. to allow
 * embedding of line numbers within code listings.
 */
const PR_NOCODE = 'nocode';

const REGEXP_PRECEDER_PATTERN = function () {
    var preceders = [
        "!", "!=", "!==", "#", "%", "%=", "&", "&&", "&&=",
        "&=", "(", "*", "*=", /* "+", */ "+=", ",", /* "-", */ "-=",
        "->", /*".", "..", "...", handled below */ "/", "/=", ":", "::", ";",
        "<", "<<", "<<=", "<=", "=", "==", "===", ">",
        ">=", ">>", ">>=", ">>>", ">>>=", "?", "@", "[",
        "^", "^=", "^^", "^^=", "{", "|", "|=", "||",
        "||=", "~" /* handles =~ and !~ */,
        "break", "case", "continue", "delete",
        "do", "else", "finally", "instanceof",
        "return", "throw", "try", "typeof"
    ];
    let pattern = '(?:^^|[+-]';
    for (let i = 0; i < preceders.length; ++i) {
        pattern += '|' + preceders[i].replace(/([^=<>:&a-z])/g, '\\$1');
    }
    pattern += ')\\s*';  // matches at end, and matches empty string
    return pattern;
    // CAVEAT: this does not properly handle the case where a regular
    // expression immediately follows another since a regular expression may
    // have flags for case-sensitivity and the like.  Having regexp tokens
    // adjacent is not valid in any language I'm aware of, so I'm punting.
    // TODO: maybe style special characters inside a regexp as punctuation.
}();

// Define regexps here so that the interpreter doesn't have to create an
// object each time the function containing them is called.
// The language spec requires a new object created even if you don't access
// the $1 members.
const pr_amp = /&/g;
const pr_lt = /</g;
const pr_gt = />/g;
const pr_quot = /"/g;
/** like textToHtml but escapes double quotes to be attribute safe. */
function attribToHtml(str: string) {
    return str.replace(pr_amp, '&amp;')
        .replace(pr_lt, '&lt;')
        .replace(pr_gt, '&gt;')
        .replace(pr_quot, '&quot;');
}

/** escapest html special characters to html. */
function textToHtml(str: string) {
    return str.replace(pr_amp, '&amp;')
        .replace(pr_lt, '&lt;')
        .replace(pr_gt, '&gt;');
}

const pr_ltEnt = /&lt;/g;
const pr_gtEnt = /&gt;/g;
const pr_aposEnt = /&apos;/g;
const pr_quotEnt = /&quot;/g;
const pr_ampEnt = /&amp;/g;
const pr_nbspEnt = /&nbsp;/g;
/** unescapes html to plain text. */
function htmlToText(html: string) {
    let pos = html.indexOf('&');
    if (pos < 0) { return html; }
    // Handle numeric entities specially.  We can't use functional substitution
    // since that doesn't work in older versions of Safari.
    // These should be rare since most browsers convert them to normal chars.
    for (--pos; (pos = html.indexOf('&#', pos + 1)) >= 0;) {
        let end = html.indexOf(';', pos);
        if (end >= 0) {
            let num = html.substring(pos + 3, end);
            let radix = 10;
            if (num && num.charAt(0) === 'x') {
                num = num.substring(1);
                radix = 16;
            }
            let codePoint = parseInt(num, radix);
            if (!isNaN(codePoint)) {
                html = (html.substring(0, pos) + String.fromCharCode(codePoint) +
                    html.substring(end + 1));
            }
        }
    }

    return html.replace(pr_ltEnt, '<')
        .replace(pr_gtEnt, '>')
        .replace(pr_aposEnt, "'")
        .replace(pr_quotEnt, '"')
        .replace(pr_nbspEnt, ' ')
        .replace(pr_ampEnt, '&');
}

/** is the given node's innerHTML normally unescaped? */
function isRawContent(node: any) {
    return 'XMP' === node.tagName;
}

const newlineRe = /[\r\n]/g;
/**
 * Are newlines and adjacent spaces significant in the given node's innerHTML?
 */
function isPreformatted(node: any, content: string) {
    // PRE means preformatted, and is a very common case, so don't create
    // unnecessary computed style objects.
    if ('PRE' === node.tagName) { return true; }
    if (!newlineRe.test(content)) { return true; }  // Don't care
    let whitespace = '';
    // For disconnected nodes, IE has no currentStyle.
    if (node.currentStyle) {
        whitespace = node.currentStyle.whiteSpace;
    } else if (window.getComputedStyle) {
        // Firefox makes a best guess if node is disconnected whereas Safari
        // returns the empty string.
        whitespace = window.getComputedStyle(node, null).whiteSpace;
    }
    return !whitespace || whitespace === 'pre';
}

function normalizedHtml(node: any, out: any, opt_sortAttrs?: any) {
    switch (node.nodeType) {
        case 1:  // an element
            let name = node.tagName.toLowerCase();

            out.push('<', name);
            let attrs = node.attributes;
            let n = attrs.length;
            if (n) {
                if (opt_sortAttrs) {
                    let sortedAttrs = [];
                    for (let i = n; --i >= 0;) { sortedAttrs[i] = attrs[i]; }
                    sortedAttrs.sort(function (a, b) {
                        return (a.name < b.name) ? -1 : a.name === b.name ? 0 : 1;
                    });
                    attrs = sortedAttrs;
                }
                for (let i: number = 0; i < n; ++i) {
                    let attr = attrs[i];
                    if (!attr.specified) { continue; }
                    out.push(' ', attr.name.toLowerCase(),
                        '="', attribToHtml(attr.value), '"');
                }
            }
            out.push('>');
            for (let child = node.firstChild; child; child = child.nextSibling) {
                normalizedHtml(child, out, opt_sortAttrs);
            }
            if (node.firstChild || !/^(?:br|link|img)$/.test(name)) {
                out.push('</', name, '>');
            }
            break;
        case 3: case 4: // text
            out.push(textToHtml(node.nodeValue));
            break;
    }
}

function combinePrefixPatterns(regexs: RegExp[]) {
    let capturedGroupIndex = 0;

    let needToFoldCase = false;
    let ignoreCase = false;
    for (let i = 0, n = regexs.length; i < n; ++i) {
        let regex = regexs[i];
        if (regex.ignoreCase) {
            ignoreCase = true;
        } else if (/[a-z]/i.test(regex.source.replace(
            /\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, ''))) {
            needToFoldCase = true;
            ignoreCase = false;
            break;
        }
    }

    function decodeEscape(charsetPart: string) {
        if (charsetPart.charAt(0) !== '\\') { return charsetPart.charCodeAt(0); }
        switch (charsetPart.charAt(1)) {
            case 'b': return 8;
            case 't': return 9;
            case 'n': return 0xa;
            case 'v': return 0xb;
            case 'f': return 0xc;
            case 'r': return 0xd;
            case 'u': case 'x':
                return parseInt(charsetPart.substring(2), 16)
                    || charsetPart.charCodeAt(1);
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7':
                return parseInt(charsetPart.substring(1), 8);
            default: return charsetPart.charCodeAt(1);
        }
    }

    function encodeEscape(charCode: number) {
        if (charCode < 0x20) {
            return (charCode < 0x10 ? '\\x0' : '\\x') + charCode.toString(16);
        }
        let ch = String.fromCharCode(charCode);
        if (ch === '\\' || ch === '-' || ch === '[' || ch === ']') {
            ch = '\\' + ch;
        }
        return ch;
    }

    function caseFoldCharset(charSet: any) {
        let charsetParts = charSet.substring(1, charSet.length - 1).match(
            new RegExp(
                '\\\\u[0-9A-Fa-f]{4}'
                + '|\\\\x[0-9A-Fa-f]{2}'
                + '|\\\\[0-3][0-7]{0,2}'
                + '|\\\\[0-7]{1,2}'
                + '|\\\\[\\s\\S]'
                + '|-'
                + '|[^-\\\\]',
                'g'));
        let groups = [];
        let ranges = [];
        let inverse = charsetParts !== null ? charsetParts[0] === '^' : false;
        for (let i = inverse ? 1 : 0, n = charsetParts.length; i < n; ++i) {
            let p = charsetParts[i];
            switch (p) {
                case '\\B': case '\\b':
                case '\\D': case '\\d':
                case '\\S': case '\\s':
                case '\\W': case '\\w':
                    groups.push(p);
                    continue;
            }
            let start = decodeEscape(p);
            let end;
            if (i + 2 < n && '-' === charsetParts[i + 1]) {
                end = decodeEscape(charsetParts[i + 2]);
                i += 2;
            } else {
                end = start;
            }
            ranges.push([start, end]);
            // If the range might intersect letters, then expand it.
            if (!(end < 65 || start > 122)) {
                if (!(end < 65 || start > 90)) {
                    ranges.push([Math.max(65, start) | 32, Math.min(end, 90) | 32]);
                }
                if (!(end < 97 || start > 122)) {
                    ranges.push([Math.max(97, start) & ~32, Math.min(end, 122) & ~32]);
                }
            }
        }

        // [[1, 10], [3, 4], [8, 12], [14, 14], [16, 16], [17, 17]]
        // -> [[1, 12], [14, 14], [16, 17]]
        ranges.sort(function (a, b) { return (a[0] - b[0]) || (b[1] - a[1]); });
        let consolidatedRanges = [];
        let lastRange = [NaN, NaN];
        for (let i = 0; i < ranges.length; ++i) {
            let range = ranges[i];
            if (range[0] <= lastRange[1] + 1) {
                lastRange[1] = Math.max(lastRange[1], range[1]);
            } else {
                consolidatedRanges.push(lastRange = range);
            }
        }

        let out = ['['];
        if (inverse) { out.push('^'); }
        out.push.apply(out, groups);
        for (let i = 0; i < consolidatedRanges.length; ++i) {
            let range = consolidatedRanges[i];
            out.push(encodeEscape(range[0]));
            if (range[1] > range[0]) {
                if (range[1] + 1 > range[0]) { out.push('-'); }
                out.push(encodeEscape(range[1]));
            }
        }
        out.push(']');
        return out.join('');
    }

    function allowAnywhereFoldCaseAndRenumberGroups(regex: RegExp) {
        // Split into character sets, escape sequences, punctuation strings
        // like ('(', '(?:', ')', '^'), and runs of characters that do not
        // include any of the above.
        let parts = regex.source.match(
            new RegExp(
                '(?:'
                + '\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]'  // a character set
                + '|\\\\u[A-Fa-f0-9]{4}'  // a unicode escape
                + '|\\\\x[A-Fa-f0-9]{2}'  // a hex escape
                + '|\\\\[0-9]+'  // a back-reference or octal escape
                + '|\\\\[^ux0-9]'  // other escape sequence
                + '|\\(\\?[:!=]'  // start of a non-capturing group
                + '|[\\(\\)\\^]'  // start/emd of a group, or line start
                + '|[^\\x5B\\x5C\\(\\)\\^]+'  // run of other characters
                + ')',
                'g'));
        let n = parts !== null ? parts.length : 0;

        // Maps captured group numbers to the number they will occupy in
        // the output or to -1 if that has not been determined, or to
        // undefined if they need not be capturing in the output.
        let capturedGroups = [];

        // Walk over and identify back references to build the capturedGroups
        // mapping.
        if (parts !== null) {
            for (let i = 0, groupIndex = 0; i < n; ++i) {
                let p = parts[i];
                if (p === '(') {
                    // groups are 1-indexed, so max group index is count of '('
                    ++groupIndex;
                } else if ('\\' === p.charAt(0)) {
                    let decimalValue = +p.substring(1);
                    if (decimalValue && decimalValue <= groupIndex) {
                        capturedGroups[decimalValue] = -1;
                    }
                }
            }

            // Renumber groups and reduce capturing groups to non-capturing groups
            // where possible.
            for (let i = 1; i < capturedGroups.length; ++i) {
                if (-1 === capturedGroups[i]) {
                    capturedGroups[i] = ++capturedGroupIndex;
                }
            }
            for (let i = 0, groupIndex = 0; i < n; ++i) {
                let p = parts[i];
                if (p === '(') {
                    ++groupIndex;
                    if (capturedGroups[groupIndex] === undefined) {
                        parts[i] = '(?:';
                    }
                } else if ('\\' === p.charAt(0)) {
                    let decimalValue = +p.substring(1);
                    if (decimalValue && decimalValue <= groupIndex) {
                        parts[i] = '\\' + capturedGroups[groupIndex];
                    }
                }
            }

            // Remove any prefix anchors so that the output will match anywhere.
            // ^^ really does mean an anchored match though.
            for (let i = 0; i < n; ++i) {
                if ('^' === parts[i] && '^' !== parts[i + 1]) { parts[i] = ''; }
            }

            // Expand letters to groupts to handle mixing of case-sensitive and
            // case-insensitive patterns if necessary.
            if (regex.ignoreCase && needToFoldCase) {
                for (let i = 0; i < n; ++i) {
                    let p = parts[i];
                    let ch0 = p.charAt(0);
                    if (p.length >= 2 && ch0 === '[') {
                        parts[i] = caseFoldCharset(p);
                    } else if (ch0 !== '\\') {
                        // TODO: handle letters in numeric escapes.
                        parts[i] = p.replace(
                            /[a-zA-Z]/g,
                            (ch: string) => {
                                let cc = ch.charCodeAt(0);
                                return '[' + String.fromCharCode(cc & ~32, cc | 32) + ']';
                            });
                    }
                }
            }

            return parts.join('');
        }

    }

    let rewritten = [];
    for (let i = 0, n = regexs.length; i < n; ++i) {
        let regex = regexs[i];
        if (regex.global || regex.multiline) { throw new Error('' + regex); }
        rewritten.push(
            '(?:' + allowAnywhereFoldCaseAndRenumberGroups(regex) + ')');
    }

    return new RegExp(rewritten.join('|'), ignoreCase ? 'gi' : 'g');
}

let PR_innerHtmlWorks: boolean | null = null;
function getInnerHtml(node: any) {
    // inner html is hopelessly broken in Safari 2.0.4 when the content is
    // an html description of well formed XML and the containing tag is a PRE
    // tag, so we detect that case and emulate innerHTML.
    if (null === PR_innerHtmlWorks) {
        let testNode = document.createElement('PRE');
        testNode.appendChild(
            document.createTextNode('<!DOCTYPE foo PUBLIC "foo bar">\n<foo />'));
        PR_innerHtmlWorks = !/</.test(testNode.innerHTML);
    }

    if (PR_innerHtmlWorks) {
        let content = node.innerHTML;
        // XMP tags contain unescaped entities so require special handling.
        if (isRawContent(node)) {
            content = textToHtml(content);
        } else if (!isPreformatted(node, content)) {
            content = content.replace(/(<br\s*\/?>)[\r\n]+/g, '$1')
                .replace(/(?:[\r\n]+[ \t]*)+/g, ' ');
        }
        return content;
    }

    let out: string[] = [];
    for (let child = node.firstChild; child; child = child.nextSibling) {
        normalizedHtml(child, out);
    }
    return out.join('');
}

function makeTabExpander(tabWidth: number) {
    let SPACES = '                ';
    let charInLine = 0;

    return function (plainText: string) {
        // walk over each character looking for tabs and newlines.
        // On tabs, expand them.  On newlines, reset charInLine.
        // Otherwise increment charInLine
        let out = null;
        let pos = 0;
        for (let i = 0, n = plainText.length; i < n; ++i) {
            let ch = plainText.charAt(i);

            switch (ch) {
                case '\t':
                    if (!out) { out = []; }
                    out.push(plainText.substring(pos, i));
                    // calculate how much space we need in front of this part
                    // nSpaces is the amount of padding -- the number of spaces needed
                    // to move us to the next column, where columns occur at factors of
                    // tabWidth.
                    let nSpaces = tabWidth - (charInLine % tabWidth);
                    charInLine += nSpaces;
                    for (; nSpaces >= 0; nSpaces -= SPACES.length) {
                        out.push(SPACES.substring(0, nSpaces));
                    }
                    pos = i + 1;
                    break;
                case '\n':
                    charInLine = 0;
                    break;
                default:
                    ++charInLine;
            }
        }
        if (!out) { return plainText; }
        out.push(plainText.substring(pos));
        return out.join('');
    };
}

const pr_chunkPattern = new RegExp(
    '[^<]+'  // A run of characters other than '<'
    + '|<!--[\\s\\S]*?-->'  // an HTML comment
    + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'  // a CDATA section
    // a probable tag that should not be highlighted
    + '|</?[a-zA-Z](?:[^>"\']|\'[^\']*\'|"[^"]*")*>'
    + '|<',  // A '<' that does not begin a larger chunk
    'g');
const pr_commentPrefix = /^<!--/;
const pr_cdataPrefix = /^<!\[CDATA\[/;
const pr_brPrefix = /^<br\b/i;
const pr_tagNameRe = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)/;

function extractTags(s: string) {
    // since the pattern has the 'g' modifier and defines no capturing groups,
    // this will return a list of all chunks which we then classify and wrap as
    // PR_Tokens
    let matches = s.match(pr_chunkPattern);
    let sourceBuf = [];
    let sourceBufLen = 0;
    let extractedTags = [];
    if (matches !== null) {
        for (let i = 0, n = matches.length; i < n; ++i) {
            let match = matches[i];
            if (match.length > 1 && match.charAt(0) === '<') {
                if (pr_commentPrefix.test(match)) { continue; }
                if (pr_cdataPrefix.test(match)) {
                    // strip CDATA prefix and suffix.  Don't unescape since it's CDATA
                    sourceBuf.push(match.substring(9, match.length - 3));
                    sourceBufLen += match.length - 12;
                } else if (pr_brPrefix.test(match)) {
                    // <br> tags are lexically significant so convert them to text.
                    // This is undone later.
                    sourceBuf.push('\n');
                    ++sourceBufLen;
                } else {
                    if (match.indexOf(PR_NOCODE) >= 0 && isNoCodeTag(match)) {
                        // A <span class="nocode"> will start a section that should be
                        // ignored.  Continue walking the list until we see a matching end
                        // tag.
                        let names = match.match(pr_tagNameRe);
                        if (names !== null) {

                            let name = names[2];
                            let depth = 1;
                            let j;
                            // end_tag_loop:
                            for (j = i + 1; j < n; ++j) {
                                var name2 = matches[j].match(pr_tagNameRe);
                                if (name2 && name2[2] === name) {
                                    if (name2[1] === '/') {
                                        if (--depth === 0) { break; }
                                    } else {
                                        ++depth;
                                    }
                                }
                            }
                            if (j < n) {
                                extractedTags.push(
                                    sourceBufLen, matches.slice(i, j + 1).join(''));
                                i = j;
                            } else {  // Ignore unclosed sections.
                                extractedTags.push(sourceBufLen, match);
                            }
                        }

                    } else {
                        extractedTags.push(sourceBufLen, match);
                    }
                }
            } else {
                let literalText = htmlToText(match);
                sourceBuf.push(literalText);
                sourceBufLen += literalText.length;
            }
        }
    }
    return { source: sourceBuf.join(''), tags: extractedTags };
}

/** True if the given tag contains a class attribute with the nocode class. */
function isNoCodeTag(tag: string) {
    return !!tag
        // First canonicalize the representation of attributes
        .replace(/\s(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g,
            ' $1="$2$3$4"')
        // Then look for the attribute we want.
        .match(/[cC][lL][aA][sS][sS]="[^"]*\bnocode\b/);
}

/**
 * Apply the given language handler to sourceCode and add the resulting
 * decorations to out.
 * @param {number} basePos the index of sourceCode within the chunk of source
 *    whose decorations are already present on out.
 */
function appendDecorations(basePos: number, sourceCode: any, langHandler: any, out: any[]) {
    if (!sourceCode) { return; }
    let job: any = {
        source: sourceCode,
        basePos: basePos
    };
    langHandler(job);
    out.push.apply(out, job.decorations);
}

function createSimpleLexer(shortcutStylePatterns: any, fallthroughStylePatterns: any) {
    let shortcuts: any = {};
    let tokenizer: any;
    (function () {
        let allPatterns = shortcutStylePatterns.concat(fallthroughStylePatterns);
        let allRegexs: any[] = [];
        let regexKeys: any = {};
        for (let i = 0, n = allPatterns.length; i < n; ++i) {
            let patternParts = allPatterns[i];
            let shortcutChars = patternParts[3];
            if (shortcutChars) {
                for (let c = shortcutChars.length; --c >= 0;) {
                    shortcuts[shortcutChars.charAt(c)] = patternParts;
                }
            }
            let regex = patternParts[1];
            let k = '' + regex;
            if (!regexKeys.hasOwnProperty(k)) {
                allRegexs.push(regex);
                regexKeys[k] = null;
            }
        }
        allRegexs.push(/[\0-\uffff]/);
        tokenizer = combinePrefixPatterns(allRegexs);
    })();

    let nPatterns = fallthroughStylePatterns.length;
    // let notWs = /\S/;

    /**
     * Lexes job.source and produces an output array job.decorations of style
     * classes preceded by the position at which they start in job.source in
     * order.
     *
     * @param {Object} job an object like {@code
     *    source: {string} sourceText plain text,
     *    basePos: {int} position of job.source in the larger chunk of
     *        sourceCode.
     * }
     */
    let decorate = (job: any) => {
        let sourceCode = job.source, basePos = job.basePos;
        /** Even entries are positions in source in ascending order.  Odd enties
          * are style markers (e.g., PR_COMMENT) that run from that position until
          * the end.
          * @type {Array.<number|string>}
          */
        let decorations = [basePos, PR_PLAIN];
        let pos = 0;  // index into sourceCode
        let tokens = sourceCode.match(tokenizer) || [];
        let styleCache: any = {};

        for (let ti = 0, nTokens = tokens.length; ti < nTokens; ++ti) {
            let token = tokens[ti];
            let style = styleCache[token];
            let match: any = void 0;

            let isEmbedded;
            if (typeof style === 'string') {
                isEmbedded = false;
            } else {
                let patternParts = shortcuts[token.charAt(0)];
                if (patternParts) {
                    match = token.match(patternParts[1]);
                    style = patternParts[0];
                } else {
                    for (let i = 0; i < nPatterns; ++i) {
                        patternParts = fallthroughStylePatterns[i];
                        match = token.match(patternParts[1]);
                        if (match) {
                            style = patternParts[0];
                            break;
                        }
                    }

                    if (!match) {  // make sure that we make progress
                        style = PR_PLAIN;
                    }
                }

                isEmbedded = style.length >= 5 && 'lang-' === style.substring(0, 5);
                if (isEmbedded && !(match && typeof match[1] === 'string')) {
                    isEmbedded = false;
                    style = PR_SOURCE;
                }

                if (!isEmbedded) { styleCache[token] = style; }
            }

            let tokenStart = pos;
            pos += token.length;

            if (!isEmbedded) {
                decorations.push(basePos + tokenStart, style);
            } else {  // Treat group 1 as an embedded block of source code.
                let embeddedSource = match[1];
                let embeddedSourceStart = token.indexOf(embeddedSource);
                let embeddedSourceEnd = embeddedSourceStart + embeddedSource.length;
                if (match[2]) {
                    // If embeddedSource can be blank, then it would match at the
                    // beginning which would cause us to infinitely recurse on the
                    // entire token, so we catch the right context in match[2].
                    embeddedSourceEnd = token.length - match[2].length;
                    embeddedSourceStart = embeddedSourceEnd - embeddedSource.length;
                }
                var lang = style.substring(5);
                // Decorate the left of the embedded source
                appendDecorations(
                    basePos + tokenStart,
                    token.substring(0, embeddedSourceStart),
                    decorate, decorations);
                // Decorate the embedded source
                appendDecorations(
                    basePos + tokenStart + embeddedSourceStart,
                    embeddedSource,
                    langHandlerForExtension(lang, embeddedSource),
                    decorations);
                // Decorate the right of the embedded section
                appendDecorations(
                    basePos + tokenStart + embeddedSourceEnd,
                    token.substring(embeddedSourceEnd),
                    decorate, decorations);
            }
        }
        job.decorations = decorations;
    };
    return decorate;
}

function sourceDecorator(options: any) {
    let shortcutStylePatterns: any[] = [], fallthroughStylePatterns: any[] = [];
    if (options['tripleQuotedStrings']) {
        // '''multi-line-string''', 'single-line-string', and double-quoted
        shortcutStylePatterns.push(
            [PR_STRING, /^(?:'''(?:[^'\\]|\\[\s\S]|'{1,2}(?=[^']))*(?:'''|$)|"""(?:[^"\\]|\\[\s\S]|"{1,2}(?=[^"]))*(?:"""|$)|'(?:[^\\']|\\[\s\S])*(?:'|$)|"(?:[^\\"]|\\[\s\S])*(?:"|$))/,
                null, '\'"']);
    } else if (options['multiLineStrings']) {
        // 'multi-line-string', "multi-line-string"
        shortcutStylePatterns.push(
            [PR_STRING, /^(?:'(?:[^\\']|\\[\s\S])*(?:'|$)|"(?:[^\\"]|\\[\s\S])*(?:"|$)|`(?:[^\\`]|\\[\s\S])*(?:`|$))/,
                null, '\'"`']);
    } else {
        // 'single-line-string', "single-line-string"
        shortcutStylePatterns.push(
            [PR_STRING,
                /^(?:'(?:[^\\'\r\n]|\\.)*(?:'|$)|"(?:[^\\"\r\n]|\\.)*(?:"|$))/,
                null, '"\'']);
    }
    if (options['verbatimStrings']) {
        // verbatim-string-literal production from the C# grammar.  See issue 93.
        fallthroughStylePatterns.push(
            [PR_STRING, /^@"(?:[^"]|"")*(?:"|$)/, null]);
    }
    if (options['hashComments']) {
        if (options['cStyleComments']) {
            // Stop C preprocessor declarations at an unclosed open comment
            shortcutStylePatterns.push(
                [PR_COMMENT, /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\r\n]*)/,
                    null, '#']);
            fallthroughStylePatterns.push(
                [PR_STRING,
                    /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/,
                    null]);
        } else {
            shortcutStylePatterns.push([PR_COMMENT, /^#[^\r\n]*/, null, '#']);
        }
    }
    if (options['cStyleComments']) {
        fallthroughStylePatterns.push([PR_COMMENT, /^\/\/[^\r\n]*/, null]);
        fallthroughStylePatterns.push(
            [PR_COMMENT, /^\/\*[\s\S]*?(?:\*\/|$)/, null]);
    }
    if (options['regexLiterals']) {
        let REGEX_LITERAL = (
            // A regular expression literal starts with a slash that is
            // not followed by * or / so that it is not confused with
            // comments.
            '/(?=[^/*])'
            // and then contains any number of raw characters,
            + '(?:[^/\\x5B\\x5C]'
            // escape sequences (\x5C),
            + '|\\x5C[\\s\\S]'
            // or non-nesting character sets (\x5B\x5D);
            + '|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+'
            // finally closed by a /.
            + '/');
        fallthroughStylePatterns.push(
            ['lang-regex',
                new RegExp('^' + REGEXP_PRECEDER_PATTERN + '(' + REGEX_LITERAL + ')')
            ]);
    }

    let keywords = options['keywords'].replace(/^\s+|\s+$/g, '');
    if (keywords.length) {
        fallthroughStylePatterns.push(
            [PR_KEYWORD,
                new RegExp('^(?:' + keywords.replace(/\s+/g, '|') + ')\\b'), null]);
    }

    shortcutStylePatterns.push([PR_PLAIN, /^\s+/, null, ' \r\n\t\xA0']);
    fallthroughStylePatterns.push(
        // TODO(mikesamuel): recognize non-latin letters and numerals in idents
        [PR_LITERAL, /^@[a-z_$][a-z_$@0-9]*/i, null],
        [PR_TYPE, /^@?[A-Z]+[a-z][A-Za-z_$@0-9]*/, null],
        [PR_PLAIN, /^[a-z_$][a-z_$@0-9]*/i, null],
        [PR_LITERAL,
            new RegExp(
                '^(?:'
                // A hex number
                + '0x[a-f0-9]+'
                // or an octal or decimal number,
                + '|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)'
                // possibly in scientific notation
                + '(?:e[+\\-]?\\d+)?'
                + ')'
                // with an optional modifier like UL for unsigned long
                + '[a-z]*', 'i'),
            null, '0123456789'],
        [PR_PUNCTUATION, /^.[^\s\w.$@'"`/#]*/, null]);

    return createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns);
}

var decorateSource = sourceDecorator({
    'keywords': ALL_KEYWORDS,
    'hashComments': true,
    'cStyleComments': true,
    'multiLineStrings': true,
    'regexLiterals': true
});

function recombineTagsAndDecorations(job: any) {
    let sourceText = job.source;
    let extractedTags = job.extractedTags;
    let decorations = job.decorations;

    let html = [];
    // index past the last char in sourceText written to html
    let outputIdx = 0;

    let openDecoration: any = null;
    let currentDecoration: any = null;
    let tagPos = 0;  // index into extractedTags
    let decPos = 0;  // index into decorations
    let tabExpander = makeTabExpander(4);

    let adjacentSpaceRe = /([\r\n ]) /g;
    let startOrSpaceRe = /(^| ) /gm;
    let newlineRe = /\r\n?|\n/g;
    let trailingSpaceRe = /[ \r\n]$/;
    let lastWasSpace = true;  // the last text chunk emitted ended with a space.

    // See bug 71 and http://stackoverflow.com/questions/136443/why-doesnt-ie7-
    let lineBreakHtml = '<br />';

    // Look for a class like linenums or linenums:<n> where <n> is the 1-indexed
    // number of the first line.
    let numberLines = job.sourceNode.className.match(/\blinenums\b(?::(\d+))?/);
    let lineBreaker: any;
    if (numberLines) {
        let lineBreaks: any[] = [];
        for (let i = 0; i < 10; ++i) {
            lineBreaks[i] = lineBreakHtml + '</li><li class="L' + i + '">';
        }
        let lineNum = numberLines[1] && numberLines[1].length
            ? numberLines[1] - 1 : 0;  // Lines are 1-indexed
        html.push('<ol class="linenums"><li class="L', (lineNum) % 10, '"');
        if (lineNum) {
            html.push(' value="', lineNum + 1, '"');
        }
        html.push('>');
        lineBreaker = function () {
            let lb = lineBreaks[++lineNum % 10];
            // If a decoration is open, we need to close it before closing a list-item
            // and reopen it on the other side of the list item.
            return openDecoration
                ? ('</span>' + lb + '<span class="' + openDecoration + '">') : lb;
        };
    } else {
        lineBreaker = lineBreakHtml;
    }

    // A helper function that is responsible for opening sections of decoration
    // and outputing properly escaped chunks of source
    function emitTextUpTo(sourceIdx: number) {
        if (sourceIdx > outputIdx) {
            if (openDecoration && openDecoration !== currentDecoration) {
                // Close the current decoration
                html.push('</span>');
                openDecoration = null;
            }
            if (!openDecoration && currentDecoration) {
                openDecoration = currentDecoration;
                html.push('<span class="', openDecoration, '">');
            }
            // This interacts badly with some wikis which introduces paragraph tags
            // into pre blocks for some strange reason.
            // It's necessary for IE though which seems to lose the preformattedness
            // of <pre> tags when their innerHTML is assigned.
            // http://stud3.tuwien.ac.at/~e0226430/innerHtmlQuirk.html
            // and it serves to undo the conversion of <br>s to newlines done in
            // chunkify.
            let htmlChunk = textToHtml(
                tabExpander(sourceText.substring(outputIdx, sourceIdx)))
                .replace(lastWasSpace
                    ? startOrSpaceRe
                    : adjacentSpaceRe, '$1&#160;');
            // Keep track of whether we need to escape space at the beginning of the
            // next chunk.
            lastWasSpace = trailingSpaceRe.test(htmlChunk);
            html.push(htmlChunk.replace(newlineRe, lineBreaker));
            outputIdx = sourceIdx;
        }
    }

    while (true) {
        // Determine if we're going to consume a tag this time around.  Otherwise
        // we consume a decoration or exit.
        let outputTag;
        if (tagPos < extractedTags.length) {
            if (decPos < decorations.length) {
                // Pick one giving preference to extractedTags since we shouldn't open
                // a new style that we're going to have to immediately close in order
                // to output a tag.
                outputTag = extractedTags[tagPos] <= decorations[decPos];
            } else {
                outputTag = true;
            }
        } else {
            outputTag = false;
        }
        // Consume either a decoration or a tag or exit.
        if (outputTag) {
            emitTextUpTo(extractedTags[tagPos]);
            if (openDecoration) {
                // Close the current decoration
                html.push('</span>');
                openDecoration = null;
            }
            html.push(extractedTags[tagPos + 1]);
            tagPos += 2;
        } else if (decPos < decorations.length) {
            emitTextUpTo(decorations[decPos]);
            currentDecoration = decorations[decPos + 1];
            decPos += 2;
        } else {
            break;
        }
    }
    emitTextUpTo(sourceText.length);
    if (openDecoration) {
        html.push('</span>');
    }
    if (numberLines) { html.push('</li></ol>'); }
    job.prettyPrintedHtml = html.join('');
}

let langHandlerRegistry: any = {};
function registerLangHandler(handler: any, fileExtensions: string[]) {
    for (let i = fileExtensions.length; --i >= 0;) {
        let ext = fileExtensions[i];
        if (!langHandlerRegistry.hasOwnProperty(ext)) {
            langHandlerRegistry[ext] = handler;
        } else if ('console' in window) {
            console['warn']('cannot override language handler %s', ext);
        }
    }
}
function langHandlerForExtension(extension: any, source: any) {
    if (!(extension && langHandlerRegistry.hasOwnProperty(extension))) {
        // Treat it as markup if the first non whitespace character is a < and
        // the last non-whitespace character is a >.
        extension = /^\s*</.test(source)
            ? 'default-markup'
            : 'default-code';
    }
    return langHandlerRegistry[extension];
}

registerLangHandler(decorateSource, ['default-code']);
registerLangHandler(
    createSimpleLexer(
        [],
        [
            [PR_PLAIN, /^[^<?]+/],
            [PR_DECLARATION, /^<!\w[^>]*(?:>|$)/],
            [PR_COMMENT, /^<!--[\s\S]*?(?:-->|$)/],
            // Unescaped content in an unknown language
            ['lang-', /^<\?([\s\S]+?)(?:\?>|$)/],
            ['lang-', /^<%([\s\S]+?)(?:%>|$)/],
            [PR_PUNCTUATION, /^(?:<[%?]|[%?]>)/],
            ['lang-', /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],
            // Unescaped content in javascript.  (Or possibly vbscript).
            ['lang-js', /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],
            // Contains unescaped stylesheet content
            ['lang-css', /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],
            ['lang-in.tag', /^(<\/?[a-z][^<>]*>)/i]
        ]),
    ['default-markup', 'htm', 'html', 'mxml', 'xhtml', 'xml', 'xsl']);
registerLangHandler(
    createSimpleLexer(
        [
            [PR_PLAIN, /^[\s]+/, null, ' \t\r\n'],
            [PR_ATTRIB_VALUE, /^(?:"[^"]*"?|'[^']*'?)/, null, '"\'']
        ],
        [
            [PR_TAG, /^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],
            [PR_ATTRIB_NAME, /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],
            ['lang-uq.val', /^=\s*([^>'"\s]*(?:[^>'"\s/]|\/(?=\s)))/],
            [PR_PUNCTUATION, /^[=<>/]+/],
            ['lang-js', /^on\w+\s*=\s*"([^"]+)"/i],
            ['lang-js', /^on\w+\s*=\s*'([^']+)'/i],
            ['lang-js', /^on\w+\s*=\s*([^"'>\s]+)/i],
            ['lang-css', /^style\s*=\s*"([^"]+)"/i],
            ['lang-css', /^style\s*=\s*'([^']+)'/i],
            ['lang-css', /^style\s*=\s*([^"'>\s]+)/i]
        ]),
    ['in.tag']);
registerLangHandler(
    createSimpleLexer([], [[PR_ATTRIB_VALUE, /^[\s\S]+/]]), ['uq.val']);
registerLangHandler(sourceDecorator({
    'keywords': CPP_KEYWORDS,
    'hashComments': true,
    'cStyleComments': true
}), ['c', 'cc', 'cpp', 'cxx', 'cyc', 'm']);
registerLangHandler(sourceDecorator({
    'keywords': 'null true false'
}), ['json']);
registerLangHandler(sourceDecorator({
    'keywords': CSHARP_KEYWORDS,
    'hashComments': true,
    'cStyleComments': true,
    'verbatimStrings': true
}), ['cs']);
registerLangHandler(sourceDecorator({
    'keywords': JAVA_KEYWORDS,
    'cStyleComments': true
}), ['java']);
registerLangHandler(sourceDecorator({
    'keywords': SH_KEYWORDS,
    'hashComments': true,
    'multiLineStrings': true
}), ['bsh', 'csh', 'sh']);
registerLangHandler(sourceDecorator({
    'keywords': PYTHON_KEYWORDS,
    'hashComments': true,
    'multiLineStrings': true,
    'tripleQuotedStrings': true
}), ['cv', 'py']);
registerLangHandler(sourceDecorator({
    'keywords': PERL_KEYWORDS,
    'hashComments': true,
    'multiLineStrings': true,
    'regexLiterals': true
}), ['perl', 'pl', 'pm']);
registerLangHandler(sourceDecorator({
    'keywords': RUBY_KEYWORDS,
    'hashComments': true,
    'multiLineStrings': true,
    'regexLiterals': true
}), ['rb']);
registerLangHandler(sourceDecorator({
    'keywords': JSCRIPT_KEYWORDS,
    'cStyleComments': true,
    'regexLiterals': true
}), ['js']);
registerLangHandler(
    createSimpleLexer([], [[PR_STRING, /^[\s\S]+/]]), ['regex']
);

function applyDecorator(job: any) {
    let sourceCodeHtml = job.sourceCodeHtml;
    let opt_langExtension = job.langExtension;

    // Prepopulate output in case processing fails with an exception.
    job.prettyPrintedHtml = sourceCodeHtml;

    try {
        // Extract tags, and convert the source code to plain text.
        let sourceAndExtractedTags = extractTags(sourceCodeHtml);
        /** Plain text. @type {string} */
        let source = sourceAndExtractedTags.source;
        job.source = source;
        job.basePos = 0;

        /** Even entries are positions in source in ascending order.  Odd entries
          * are tags that were extracted at that position.
          * @type {Array.<number|string>}
          */
        job.extractedTags = sourceAndExtractedTags.tags;

        // Apply the appropriate language handler
        langHandlerForExtension(opt_langExtension, source)(job);
        console.log(job);
        // Integrate the decorations and tags back into the source code to produce
        // a decorated html string which is left in job.prettyPrintedHtml.
        recombineTagsAndDecorations(job);
    } catch (e) {
        if ('console' in window) {
            console['log'](e && e['stack'] ? e['stack'] : e);
        }
    }
}

// function prettyPrintOne(sourceCodeHtml: any, opt_langExtension: any) {
//     let job: any = {
//         sourceCodeHtml: sourceCodeHtml,
//         langExtension: opt_langExtension
//     };
//     applyDecorator(job);
//     return job.prettyPrintedHtml;
// }

function prettyPrint(opt_whenDone?: any) {

    function byTagName(tn: any) { return document.getElementsByTagName(tn); }
    // fetch a list of nodes to rewrite
    let codeSegments = [byTagName('pre'), byTagName('code'), byTagName('xmp')];
    let elements: any[] = [];
    for (let i = 0; i < codeSegments.length; ++i) {
        for (let j = 0, n = codeSegments[i].length; j < n; ++j) {
            elements.push(codeSegments[i][j]);
        }
    }
    codeSegments = [];

    let clock = Date;
    // if (!clock['now']) {
    //   clock = { 'now': function () { return (new Date).getTime(); } };
    // }

    // The loop is broken into a series of continuations to make sure that we
    // don't make the browser unresponsive when rewriting a large page.
    let k = 0;
    let prettyPrintingJob: any;
    
    function doWork() {
        let endTime = clock.now() + 250 /* ms */;
        for (; k < elements.length && clock.now() < endTime; k++) {
            let cs = elements[k];
            // [JACOCO] 'prettyprint' -> 'source'
            if (cs.className && cs.className.indexOf('source') >= 0) {
                // If the classes includes a language extensions, use it.
                // Language extensions can be specified like
                //     <pre class="prettyprint lang-cpp">
                // the language extension "cpp" is used to find a language handler as
                // passed to PR_registerLangHandler.
                let langExtension = cs.className.match(/\blang-(\w+)\b/);
                if (langExtension) { langExtension = langExtension[1]; }

                // make sure this is not nested in an already prettified element
                let nested = false;
                for (let p = cs.parentNode; p; p = p.parentNode) {
                    if ((p.tagName === 'pre' || p.tagName === 'code' ||
                        p.tagName === 'xmp') &&
                        // [JACOCO] 'prettyprint' -> 'source'
                        p.className && p.className.indexOf('source') >= 0) {
                        nested = true;
                        break;
                    }
                }
                if (!nested) {
                    // fetch the content as a snippet of properly escaped HTML.
                    // Firefox adds newlines at the end.
                    let content = getInnerHtml(cs);
                    content = content.replace(/(?:\r\n?|\n)$/, '');

                    // do the pretty printing
                    prettyPrintingJob = {
                        sourceCodeHtml: content,
                        langExtension: langExtension,
                        sourceNode: cs
                    };
                    applyDecorator(prettyPrintingJob);
                    replaceWithPrettyPrintedHtml();
                }
            }
        }
        if (k < elements.length) {
            // finish up in a continuation
            setTimeout(doWork, 250);
        } else if (opt_whenDone) {
            opt_whenDone();
        }
    }

    function replaceWithPrettyPrintedHtml() {
        let newContent = prettyPrintingJob.prettyPrintedHtml;
        if (!newContent) { return; }
        let cs = prettyPrintingJob.sourceNode;

        // push the prettified html back into the tag.
        if (!isRawContent(cs)) {
            // just replace the old html with the new
            cs.innerHTML = newContent;
        } else {
            // we need to change the tag to a <pre> since <xmp>s do not allow
            // embedded tags such as the span tags used to attach styles to
            // sections of source code.
            let pre = document.createElement('PRE');
            for (let i = 0; i < cs.attributes.length; ++i) {
                let a = cs.attributes[i];
                if (a.specified) {
                    let aname = a.name.toLowerCase();
                    if (aname === 'class') {
                        pre.className = a.value;  // For IE 6
                    } else {
                        pre.setAttribute(a.name, a.value);
                    }
                }
            }
            pre.innerHTML = newContent;

            // remove the old
            cs.parentNode.replaceChild(pre, cs);
            cs = pre;
        }
    }

    doWork();
}

let lang: string = "";

function Pretty(props: {lang: string, children: any[]}) {
    lang = props.lang;
    return(
        <pre className='source lang-java linenums'>
            <ol className='linenums'>
                {props.children}
            </ol>
        </pre>
    );
};

function Line(props: {lineNum: number, source: string, appendix: {title: string, classValue: string}}) {
    let sourceCode = props.source;
    let prettyJob: any = {
        sourceCodeHtml: sourceCode,
        langExtension: lang,
    };
    let opt_langExtension = prettyJob.langExtension;
    let sourceAndExtractedTags = extractTags(prettyJob.sourceCodeHtml);
    let source = sourceAndExtractedTags.source;
    prettyJob.source = source;
    prettyJob.basePos = 0;
    prettyJob.extractedTags = sourceAndExtractedTags.tags;
    langHandlerForExtension(opt_langExtension, source)(prettyJob);
    console.log(prettyJob);
    // let lineBreakHtml = '<br />';

    let spans: any[] = [];
    let offset: number = 0;
    let keyIndex = 0;
    for(let i = 0, decIndex = 0; i < prettyJob.decorations.length; ) {
        let startPos: number = prettyJob.decorations[i];
        if(prettyJob.extractedTags.length > decIndex + 1) {
            if(startPos === prettyJob.extractedTags[decIndex]) {
                let len = prettyJob.extractedTags[decIndex+1].length;
                let content = prettyJob.extractedTags[decIndex+1].substring(1, len-1);
                spans.push(<span className="pln" key={`${props.lineNum - 1}-${keyIndex++}`}>{"<"}</span>);
                spans.push(<span className="typ" key={`${props.lineNum - 1}-${keyIndex++}`}>{content}</span>);
                spans.push(<span className="pln" key={`${props.lineNum - 1}-${keyIndex++}`}>{">"}</span>);
                decIndex += 2;
                offset += len;
                continue;
            }
        }
        let attr: string = prettyJob.decorations[i+1];
        let content: string = "";
        if(i + 2 >= prettyJob.decorations.length) {
            content = sourceCode.substring(startPos+offset);
        } else {
            let endPos = prettyJob.decorations[i+2]
            content = sourceCode.substring(startPos+offset, endPos+offset);
        }
        spans.push(<span className={attr} key={`${props.lineNum - 1}-${keyIndex++}`}>{content}</span>);
        i += 2;
    }

    return (
        <li className={`L${props.lineNum - 1}`} key={`${props.lineNum - 1}`}>
            <span className={props.appendix.classValue} title={props.appendix.title}>
                {spans}
            </span>
        </li>
    );
};


export { prettyPrint, Pretty, Line };