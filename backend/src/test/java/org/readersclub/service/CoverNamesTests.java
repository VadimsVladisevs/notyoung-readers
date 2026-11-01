package org.readersclub.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CoverNamesTests {

    @ParameterizedTest
    @CsvSource(delimiter = '|', textBlock = """
            Акутагава              | Ворота Расёмон          | akutagava-vorota-rasemon
            Бакман                 | Бабушка велела кланяться | bakman-babushka-velela-klanjatjsja
            Достоевский            | Идиот                   | dostoevskij-idiot
            Солженицын             | Один день Ивана Денисовича | solzhenicyn-odin-denj-ivana-denisovicha
            Пелевин                | Чапаев и Пустота        | pelevin-chapaev-i-pustota
            Щербакова              | Вам и не снилось        | scherbakova-vam-i-ne-snilosj
            Ильф                   | Объявление              | iljf-objavlenie
            Эко                    | Имя розы                | eko-imja-rozy
            Remarque               | Drei Kameraden          | remarque-drei-kameraden
            Gabriel García Márquez | Cien años de soledad    | gabriel-garcia-marquez-cien-anos-de-soledad
            '  Orwell  '           | '  1984!!  '            | orwell-1984
            O'Brien                | "Hello, world?"         | o-brien-hello-world
            """)
    void slugsAuthorAndTitle(String author, String title, String expected) {
        assertEquals(expected, CoverNames.base(author, title));
    }

    @Test
    void skipsEmptyParts() {
        assertEquals("orwell", CoverNames.base("Orwell", "!!!"));
        assertEquals("1984", CoverNames.base("", "1984"));
        assertEquals("cover", CoverNames.base("???", "!!!"));
    }

    @Test
    void capsTheLengthWithoutATrailingHyphen() {
        String base = CoverNames.base("author", "word ".repeat(40));

        assertTrue(base.length() <= CoverNames.MAX_LENGTH, base);
        assertTrue(base.startsWith("author-word-word"), base);
        assertTrue(!base.endsWith("-"), base);
    }

    @Test
    void addsTheExtensionAndASuffixFromTwo() {
        assertEquals("orwell-1984.jpeg", CoverNames.fileName("orwell-1984", 1));
        assertEquals("orwell-1984-2.jpeg", CoverNames.fileName("orwell-1984", 2));
        assertEquals("orwell-1984-3.jpeg", CoverNames.fileName("orwell-1984", 3));
    }
}
