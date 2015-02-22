/*
 *	Bitmap fonts for RetroSim
 *
 *	USAGE:
 *		ctx.addFont(fontObject, callback); // add font once
 *      ctx.font('id');                    // use font with 'id'
 *      ctx.text('Hi', 2, 2);              // draw text
*/

/*
 *	Epistemex RetroFont (simple) 6x8
 *	Public Domain
*/
var fontRetro = {
	id			: 'retro',	// used with font() after font is added using addFont()
	type		: 'font',	// for resource handler / loader
	charWidth	: 6,		// width of each glyph in pixels
	charHeight	: 8,		// height of each gyph in pixels
	CORS		: false,	// optional: need to load from cross-origin?
	invert		: false,	// optional: invert image before parsing (default false)

	// map defines what char to use for each index in the image
	map			: ' !"#$% \'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~§',

	// url or embed as data-uri
	url	: 'data:image/gif;base64,R0lGODlhwAAYAIAAAP///wAAACH5BAAAAAAALAAAAADAABgAAAL/hG+BqgntUoMorour3vzMQIWgN5IS+KUlSlJdprlsFz6efUo4J8cOc3sJIx+dBUjE9Sy/G8T1glaewY30NELChNfUdmhtAqVL5DJMpT5EMFSJCf9enu8duLtmuclumnMHRTdBNNOXMZN3NQXGpGg3ZWgzyBhHWEPp86dWNRfZdFR1xrXgeYk51+LkuMg6xvkYs7kGyikbCNj4R0jK6ofpqIU7S2laKccLW9i3l4MRiSjzhpjZS/16ip19uqrd7c3IjQ29Mq6CxWBYGFSuFYyrpixNLq/S/q4rqRofN62Yhm/v3xaBwhYR1JFlEMGAAEM1XFgwiZyDzhh+cijq0SYy/0rguFpx76LFXhDhhXQ4EVy+NOoOJWomKSE0NNIMrswn8qQXlDh72rJTjJ9KPcvwgcoIsZIZj7qy6FMYsw4tYUurtqn2KpzGh1wHNpw68ihCox118oQ6yylYa1mJ5Xw2r14ykJZSvSuaMw8/V3Vr1dlYUNC8TNOGSP2GOLHixYwR75kURiUPPGwvXmtsGPMdr6iMGIPli3Bkt1g1jzIdWqhlqXRU2U0LM5pTeWimfkJnF/dY3Xpfmi35VFayKKuK+FQSsGVM201rrUS7HGdCy7nerisL9BrHyTTo9jyaziVgH/1QjTw/96d1e2s5H/PcyohFtQP18Oys/jjL2+6c5TS1Cl14WN3SXYFjCGLCTqAd15tApiSlDm3ulIKgc5D1wIxz78GH2mRa9YaZPx12d1gU3RQAADs='
};

/*
 *	Epistemex RetroFont bold (simple) 7x8
 *	Public Domain
*/
var fontRetroBold = {
	id			: 'retrobold',
	type		: 'font',
	charWidth	: 7,
	charHeight	: 8,
	map			: ' !"#$% \'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~§',
	url	: 'data:image/gif;base64,R0lGODlh4AAYAIAAAP///wAAACH5BAAAAAAALAAAAADgABgAAAL/hH8RqNC+Hkxroispq/r6D4KPkpUkZVbkCY2ryrZc+GWevdKW0bhWPrHdZrtOJNLRKXkwJpPj88mcG6om2lwmQxKpiIh5vYbabXVqLteaJ2D4jcaBr+xsawOdjc/8ta4HY6Jm9SYmI/SEyAeYR5bo5MKyl+Q2qaT41efHZRg3d/kZqfeZSFrU1qgJaRlk12VHCIonpzq4+nirJjQSZIaJsuUlaDRKJjUMaBVzl+Y4+NtKCas13AxHIwkGZNjpRjVZSRQOvWtabouero5tuu7+/g69Ph74KlrPaJ8lipIcfeaP36F+pQgeOpIrIMJ/+QSWq7ZJ4Y+FEmkBpJiqUJ0w/zmwJMQ4MaSyjQxBevkmbo4+Tnc8/iNWJKbFV34kzmJUMqRLf9d2gkQDdOS1WpwQYskGpyGuVkfC1Ywhp+MYnzr3LaOZU9goiOeGgpIqNRdMi2NdqTQ67SiqVdnAdt1xrK3cPmQ1ybNLsiJJX3kzUp2J1mRKkTbhWr3307AzvM/Qsl058GBMTyghq9VbeVq0uFyvpiqsT+DFu17hmT6NOrXq1V+hmmtXGg/LxXRos258W1cxvPaIxvpDimdsWcNzEzcOvDTkJz1DGyyJtV/T3sYWnqLIzJNrVNvxoaz6sapTVeTkxQW/lul5rU8VSxccHqdLun0JI72eBtGvZUPWD2FWfxJVv6lHX1hZ1fdQRuAB6JdZXr31RXA/YZYeb6Cd9RIy8B3YkoS3cIZPPdL9VteAsrGk1FIKRadRZt8Jh5VN29BjXUHALIWfVRp5A9Fk/SGnG2nP5YaJkMaxsoSRIBQAADs='
};

/*
 *	Epistemex RetroFont Big (simple) 12x16
 *	Public Domain
*/
var fontRetroBig = {
	id			: 'retrobig',
	type		: 'font',
	charWidth	: 12,
	charHeight	: 16,
	map			: ' !"#$% \'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~§',
	url	: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwAQMAAAAitD89AAAABlBMVEX///8AAABVwtN+AAAD6ElEQVRIx5XTwcrTQBAH8CkD5jIm1x6Wig8gLHgwYiGvovgCAS8exFYK9qL4SlMj1MPS+gCCKR689LDHCIH4392kVvxU3G8p20l/+WZ2Z4lI77OVQrBgUqE0pCKt2BdFX2GyR4iJLBbXIKP2AlavdLXt7hT96l2PBUIZUZl1I6giyKl2qhHMd42eDuaR0EkFC4RyIpObEayKORZzmk/Avt+rOrkvpCpYIGRgRAKgondksQK4RyP4cFBSeQZAASxZy6LP6Cd4TAQkixE8dk5nKk8DMKdDAHXR89pEgJRIExiOPTyCyI033dfCD1SutohQSzTTcgTVq/XvIOOuKbphXa82F1CPKUlDv6Q0WwPk8Gp22p7i8cSU2itwXTTTR1UTgOhONYJYdHwaUnq9TMDFhwXTJ9VShEm0WaddMvEoJnArgHhwEdyiVrXODWOLGsLBAeTxKMaiRQJIrRGAEDpi2HdcdKsNoTVQVWgN0l9Aaj4TAXpuaDwXvmIKzcex+QL4bZR008jpj8PeGJVpgX83YMYEtPGVExXBYkhxfI0zPGUPFQoaMGOJI8hNu0cwzivQsl8AYMt2mI7wO1UlPC6WLSJxioyAGqrJ3gdI3xVAJAKjRe+nFyeAl84a1GbvAjTx1xFQBKXePk+AEnj2es4bKkEw9k52v4BaxXUJHEZQZWXGNE/ggILekB59L/0AcGwBPiew9wks2OZMJgF3E8BbdphNB3AKwBumPIHjsZ9Skikl2Ye3uGFtAJ68cdWsLZlujTW86/UXUGLRAMh5WAvGs7fnZ2utmbIEVH7ZVnUmAZXnyArjftGfVFsmTqAVuT44ZKwxonmpOLjcVMVSMQDWEdROUmtoFlpj9UYGlIs2yc667yTrFvFFaI1Z4wN4CBCbTzk2nwSAhbLDp3Dc2QgogTtr+o9RDFTQfwKh8Z5CKv4c2ZsvkxVSUX8ByO3voBZqF9fgocaF/Am0QvWDtad8AvYfQCVcIE8Z65H9svGWuyMjJWvZInJkh89BpiuqARAAc/tl273cdzbrv2wiyLovW8zzl+0ITgA7gBIgVPP9YL4dzJDLd42g6BH5fnjx/UA23bg3ghsnJAlY71J7io/tbcUh4t3ST6ASyfgC2LeOdscez9p4gQBaJ60zbeYjcAuRfHZJKZtALjoBjUC5AzgB5GJoKprylBKhaB1TEo0pKRkbCnBV1pdX4HksmiwnYEuAWDTAwwPuQ/9s09fx4FJK57it3lLsamcNwD5sqxbdnW23yLqTyqChNSJgNx4cGYCTQ0aQ4eC08AV7YatqBg3NF8FlcIeP1XQ9lOSqq/Fo/H4Ngq7oRuAv4AdPMO2zOo4CGAAAAABJRU5ErkJggg=='
};

/*
 *	Commodore 64 font 8x8
 *	Public Domain
*/
var fontC64 = {
	id			: 'c64',
	type		: 'font',
	charWidth	: 8,
	charHeight	: 8,
	map			: '@abcdefghijklmnopqrstuvwxyz[£]ï÷ !"#$%&\'()*+,-./0123456789:;<=>?–ABCDEFGHIJKLMNOPQRSTUVWXYZ±€|ƒ"…†‡ˆ‰Š‹ŒŽ™Ÿ¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶',
	url	: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAAgCAMAAADKd1bWAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFAAAA////pdmf3QAAAAJ0Uk5T/wDltzBKAAADF0lEQVR42txZi1brMAyT//+nLxfW1pZkJ90GnEMP2+iaNo4iy48hAh9H/MHjWtfXp18nPq/mK3YU+NHuWv3vPHsZ3yfvvwz4/Lu+OXE5AfgyEceHIBj5enoOGDxv9rEBxwtlR8o5mnPk+xPAgPmeFqKGXAYVAKIaWICok0ImpJ1+XCuA4WFZtxi7QAvg9fzTgMq6vMDLvmz+CdRlpVlYpTNA0MlYBkBdcBeAysAOgLpVYkfHgGrPA4DBkG5HhBmxYsBBN7OQxqUc4EHjzbku12nA4QIx+aCbyIhdve6/Z58VzQkGPlGIxOIYTJtTKB5VQoz9ON+ejjKYw89tjX8lXuxPW8YhHOEctU8qcXRQD3jS8uRa4RgFilbGBdoZzMmDIWsAmjDUqY3ThGkzHNAyT6NJfeSY8ogyTwuARgnJqKwkWK2YyJjzEDY5PxCqGSX8KfAmbSHDLAAiSIaiQ8aTgANTz955gayehXARaXCZdRbL0GDUOFR5zUZMKd8mAxbxOzje99qkId+t1lIXK3oW6nlfW2mA98GgRbm7Jr9fJ2SL+bsooDH5zBgo0Np85ZYIRaiqi7qHSYAWUYOrIRsFVgx4Y1n6W+Xw1iizM1qtxbBDTiy7lNpngkN1GC9Ug2GDhgyWhMRVXWg8q6kFsm05tU2vOxVhWw1aADh1awBQNdsthjogFACWpBoe31AOx1gOh4n6bVFZDNOiClCtORIYLpNzfCegEBYAZp4Xu7YfwGKYpZrq6xDsCgD3GTC7gAlKQAKu7ztM5bD0A3xmCpRMZkMDBire0oA0Xu8bgE5UJkr7fgDrie9KPKUBqyjgRTOoNcaqvNEPgO8vWIrr86LauasB8XePEQCpBjW7qx7kMtS2Ey7su1EbRNiHmMKqHEN+Qz0p0vLdhsoSgMKo3wYA3wdAX365tO/7AOiY2vyQ8wMAuJBbn9lvV3dsANA1mewEOwA0PtW6wJC8+az++wHgWrLt4ZLIvQjAoAHChJ1yedMFxBWWLdIXAdjpVOwAYDb5XQDEWwFQ3jYA+LT75wG48TPB/zH/BBgAzl0V08IRIVMAAAAASUVORK5CYII='
};
