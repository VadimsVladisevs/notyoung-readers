package org.readersclub.service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/** Builds a cover file name `<author>-<title>.jpeg`: transliterated, lowercase, hyphens only. */
public final class CoverNames {

    static final int MAX_LENGTH = 80;

    // Same style as the legacy file names (e.g. smertj, zemlja, djavol)
    private static final Map<Character, String> CYRILLIC = Map.ofEntries(
            Map.entry('а', "a"), Map.entry('б', "b"), Map.entry('в', "v"), Map.entry('г', "g"),
            Map.entry('д', "d"), Map.entry('е', "e"), Map.entry('ё', "e"), Map.entry('ж', "zh"),
            Map.entry('з', "z"), Map.entry('и', "i"), Map.entry('й', "j"), Map.entry('к', "k"),
            Map.entry('л', "l"), Map.entry('м', "m"), Map.entry('н', "n"), Map.entry('о', "o"),
            Map.entry('п', "p"), Map.entry('р', "r"), Map.entry('с', "s"), Map.entry('т', "t"),
            Map.entry('у', "u"), Map.entry('ф', "f"), Map.entry('х', "h"), Map.entry('ц', "c"),
            Map.entry('ч', "ch"), Map.entry('ш', "sh"), Map.entry('щ', "sch"), Map.entry('ъ', ""),
            Map.entry('ы', "y"), Map.entry('ь', "j"), Map.entry('э', "e"), Map.entry('ю', "ju"),
            Map.entry('я', "ja"));

    private CoverNames() {
    }

    /** The name without suffix or extension, at most {@link #MAX_LENGTH} chars; "cover" if nothing is left. */
    static String base(String author, String title) {
        String joined = Stream.of(slug(author), slug(title))
                .filter(part -> !part.isEmpty())
                .collect(Collectors.joining("-"));
        if (joined.length() > MAX_LENGTH) {
            joined = joined.substring(0, MAX_LENGTH).replaceAll("-+$", "");
        }
        return joined.isEmpty() ? "cover" : joined;
    }

    /** {@code n == 1} gives {@code base.jpeg}, otherwise {@code base-n.jpeg}. */
    static String fileName(String base, int n) {
        return (n == 1 ? base : base + "-" + n) + ".jpeg";
    }

    private static String slug(String text) {
        StringBuilder latin = new StringBuilder();
        for (char c : text.toLowerCase(Locale.ROOT).toCharArray()) {
            latin.append(CYRILLIC.getOrDefault(c, String.valueOf(c)));
        }
        // Drops accents: é → e, ñ → n
        return Normalizer.normalize(latin, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
}
