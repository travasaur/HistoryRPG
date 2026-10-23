# HistoryRPG: Sivart's Journey — Game Design Bible

Oct 22, 2026 · @Travis

## Overview

HistoryRPG is a solo, story-driven, open-world-feeling RPG in which 8th graders review California's Grade 8 U.S. History standards by living them as Sivart, a young protagonist who moves through American history from the world before 1750 to the Industrial Age.

| Item | Decision |
| --- | --- |
| Working title | HistoryRPG: Sivart's Journey |
| Players | 1 (solo), one save per student |
| Audience | 8th grade, California HSS Grade 8; pacing follows IMPACT: California, Grade 8 (5 units, 19 chapters) |
| Use | 50-minute class periods and at home as a study tool; levels play in any order and each stands alone |
| Feel | Top-down 2D pixel RPG (Stardew Valley / Pokémon feel): free roaming inside each level, quests, NPC dialogue, a journal, light progression, lite combat |
| Content rule | Every main quest ties to a named standard; history is accurate, multiple perspectives are shown, and choices never rewrite real outcomes |
| Build target | Browser game for school Chromebooks (HTML/JS, likely Phaser), built in Claude Code; a desktop build is a possible later step |

**Design goals**

1. Students recall content because they did something with it, not because they read it.
2. Each textbook chapter plays as its own explorable level with a main story line that covers the chapter's focus, plus optional side quests.
3. Historical thinking skills (sourcing, causation, perspective, geography) are the core mechanics, not quizzes bolted on.
4. Content lives in data files, so new quests and sources can be added without new code.

## Standards map

The game follows IMPACT: California, Grade 8 exactly: its 5 units become 5 Acts and its 19 chapters become 19 Levels, so Level 12 is always textbook Chapter 12. A bonus Act 6 (Levels 20–22) covers the rest of standard 8.12 that the textbook leaves out. Each level's main quest must cover that chapter's full focus; side quests add depth and fun.

The [Grade 8 framework's](https://www.cde.ca.gov/ci/hs/cf/documents/hssfwchapter12.pdf) three course-wide questions stay the spine of the story: What did freedom mean to the nation's founders, and how did it change over time? How and why did the United States expand? Who is considered an American?

| Act (unit) | Level | Title | Years | Standards | Chapter focus the main quest must cover |
| --- | --- | --- | --- | --- | --- |
| 1. Colonial Roots and Revolution | 1 | The World Before 1750 | to 1750 | Review (Gr. 5–7) | Native American cultures, early global trade, Renaissance shift in European ambitions |
| 1 | 2 | European Colonization | 1500s–1700s | Review; 8.2 (Mayflower Compact) | Spanish, French, English settlements; Pilgrims and Puritans; Mayflower Compact; early regional economies |
| 1 | 3 | Life in the Colonies | 1700s | Review; 8.1 | Social structure, Great Awakening, enslavement, triangle trade |
| 1 | 4 | The Road to Revolution | 1754–1775 | 8.1 | French and Indian War, British taxation acts, rising friction, outbreak of rebellion |
| 1 | 5 | The American Revolution | 1775–1783 | 8.1 | Declaring independence, major campaigns, Washington's role, Treaty of Paris |
| 2. Building a New Nation | 6 | Creating the Constitution | 1781–1788 | 8.2 | Articles of Confederation weaknesses, Convention compromises, ratification debates |
| 2 | 7 | The Constitution | 1787–today | 8.2, 8.3 | Three branches, federalism, Bill of Rights, civic responsibilities |
| 2 | 8 | The Federalist Era | 1789–1801 | 8.3, 8.5 | Washington and Adams administrations, first parties, foreign policy stress |
| 3. Growth and Westward Expansion | 9 | The Jefferson Era | 1801–1815 | 8.4, 8.5, 8.8 | Jefferson's election, Louisiana Purchase, Lewis and Clark |
| 3 | 10 | Industrial Revolution and Growth | 1790s–1850 | 8.6 | Geography and inventions (cotton gin, mills), factory wage labor, capitalism |
| 3 | 11 | The Jacksonian Era | 1824–1840 | 8.8 | Jackson's presidency, expanded voting, Bank War, Indian Removal Act |
| 3 | 12 | Manifest Destiny | 1830s–1850 | 8.8 | Oregon Trail, Texas independence, Mexican-American War, Gold Rush |
| 4. Regional Divisions and Social Change | 13 | North and South Diverge | 1800–1860 | 8.6, 8.7 | Northern industry vs. plantation slave-labor economy of the South |
| 4 | 14 | Social Reform and Culture | 1820s–1860 | 8.6, 8.9 | Second Great Awakening, temperance, education reform, women's rights, abolition |
| 5. Sectional Crisis, Civil War, and Aftermath | 15 | The Impending Crisis | 1850–1860 | 8.9, 8.10 | Compromises over slavery, Fugitive Slave Act, Dred Scott, John Brown's raid, Lincoln's election |
| 5 | 16 | The Civil War Begins | 1861–1862 | 8.10 | Secession, Union vs. Confederate resources, early strategies, first battles |
| 5 | 17 | Fighting the Civil War | 1862–1865 | 8.10 | Emancipation Proclamation, Gettysburg and Vicksburg, home front, final campaigns |
| 5 | 18 | Reconstruction | 1865–1877 | 8.11 | Presidential vs. Congressional Reconstruction, 13th–15th Amendments, Freedmen's Bureau, rise of Jim Crow |
| 5 | 19 | The New West and Industrial Age | 1860s–1900 | 8.12 | Transcontinental Railroad, closing of the frontier, conflict with Native Americans, economic boom |
| 6. Industrial Age (bonus) | 20 | Industry and Big Business | 1870s–1900 | 8.12 | Resources and markets, government aid to business, Carnegie, Rockefeller, Stanford, inventors, Grange and Populists |
| 6 | 21 | Immigration and the Growing City | 1880–1914 | 8.12 | New immigrants, urbanization, assimilation, nativism, Chinese Exclusion Act |
| 6 | 22 | Labor and the Progressive Era | 1880–1914 | 8.12 | Child labor, laissez-faire, unions and strikes, muckrakers, Progressive reforms, conservation |

Levels 1–3 review grade 5 and 7 content that the textbook revisits, so they carry fewer 8th grade standards. Standard numbers are at the strand level; sub-standard tags (8.1.1 and so on) still need to be checked against the CA content standards before quests are tagged.

## Protagonist and framing story

Sivart is a present-day 8th grader pulled into the past; he is a witness and recorder, not a fixer, so he can never change real outcomes. His goal is to restore a fading record of what happened and who it happened to.

**Premise.** Sivart finds a half-blank journal in his school library called the Living Record. Opening it drops him into the Americas before 1750. The Record's keeper, Graham Senoj (students call him Mr. Senoj), explains that the Record is fading: pages, voices, and whole perspectives are going blank. Each level Sivart completes writes a chapter back in, but only if he gathers evidence from more than one point of view.

**Antagonist: the Fade.** A force that erases the parts of history people find inconvenient. It shows up as grayed-out NPCs, blank documents, empty-looking districts, and, in lite combat, as Fade wisps that Sivart pushes back with the Record's light. It rewards seeking multiple perspectives and punishes one-sided evidence.

**Story arc by act**

1. **Act 1 — Roots.** Sivart sees a world of many peoples before 1750, watches Europeans arrive and colonies grow, and follows the colonists' road to revolution. Question he carries: Why was there an American Revolution?
2. **Act 2 — Blueprint.** He watches the founders turn ideals into a government, and notices who "We the People" leaves out. Question: How much power should government have, and for whom?
3. **Act 3 — Expansion.** The nation doubles, then doubles again; the Fade is strongest in pages about Native nations, Mexican Californians, and enslaved workers. Question: How and why did the United States expand?
4. **Act 4 — Divided Paths.** North and South grow apart while reformers push the nation to live up to its ideals. Question: What did freedom mean, and to whom?
5. **Act 5 — Crisis and Rebirth.** The Union breaks, fights, and is rebuilt, then rushes west and into the industrial age. Question: Who is considered an American?
6. **Finale — The Final Page.** Back in the present, Sivart writes the Record's last page himself, answering "Who is considered an American?" in his own words. That page is the student's capstone response.

Because levels play in any order, each one opens with a short Mr. Senoj briefing that recaps where Sivart is in time, so no level depends on the one before it.

**Content guardrails**

- Sivart never plays as an enslaver, never chooses to harm real people, and never alters real events.
- Lite combat targets only fictional threats (Fade wisps, wildlife, bandits, storms), never real historical groups.
- Enslaved and Native perspectives come from their own primary sources wherever possible (Equiano, Douglass, Jacobs, Cherokee petitions, Chief Joseph).
- Violence is described, not shown in gameplay detail; tone matches what you would use in class.

## World structure

The Archive is a present-day hub; from it, the player can open any of 22 levels, grouped into 5 acts that follow the textbook's units plus a bonus Act 6.

&#91;embedded content: world structure · hub, 6 acts, 22 levels, finale\]

All levels are open from the start; a glowing "suggested next" marker follows textbook order so most students play in sequence. Inside a level the player roams freely and finishes with its Chronicle Trial.

## Level outlines

Each level is sized so its main quest fits one 50-minute period; side quests, collectibles, and minigames stretch it for home play. Main quests cover the textbook chapter's full focus; side quests marked *(fun)* have looser historical tie-ins and exist for play.

### Act 1 — Our Colonial Roots and Revolution

#### Level 1 — The World Before 1750

- **Map:** a Pueblo village, a Haudenosaunee longhouse town, an Ohlone coastal village, a Mississippian mound city, a global trade market, a Renaissance workshop, the Lisbon docks.
- **Main quest:** visit three Native cultures and match each to its environment → join a trans-Saharan / Silk Road trade caravan to see what Europe wanted → a Renaissance workshop (printing press, compass, astrolabe, caravel) → watch ships leave Lisbon and log why Europeans sought sea routes.
- **Side quests:** the Haudenosaunee Great Law of Peace (a seed for Act 2); build a tule reed boat with Ohlone villagers *(fun)*; Mansa Musa's gold *(fun)*; an invention puzzle in a da Vinci-style notebook *(fun)*.
- **Trial:** How did trade and new ideas change what Europeans wanted?

#### Level 2 — European Colonization of North America

- **Map:** a Spanish mission and Santa Fe, a French fur-trading post, Jamestown, Plymouth, Boston.
- **Main quest:** Spanish missions and the Columbian Exchange → French fur trade and Native alliances → Jamestown's starving time, tobacco, and the House of Burgesses, then compare the 1636 and 1651 maps of Virginia to open the Map Room → aboard the Mayflower, help the Pilgrims assemble the Mayflower Compact → Puritan Boston → a regional-economies map puzzle (New England, Middle, Southern).
- **Side quests:** the Lost Colony of Roanoke History Mystery; Tisquantum teaches corn planting (farming minigame); Columbian Exchange crop sorter; found your own colony in Settlers of America; Roger Williams and Anne Hutchinson leave Massachusetts; pirate ship at sea *(fun)*.
- **Lite combat:** fend off pirates boarding a supply ship.
- **Trial:** How did geography shape each colonial region's economy?

**Added from your test:** core — Virginia's headright system and indentured servants' work contracts; Maryland's Toleration Act of 1649 protecting religious minorities; the middle colonies as the wheat-and-grain "breadbasket" in the regional-economies puzzle.

#### Level 3 — Life in the American Colonies

- **Map:** a New England town, Philadelphia, Charleston, an Atlantic trade ship.
- **Main quest:** climb the colonial social ladder by talking to gentry, middling families, indentured servants, and enslaved people → hear George Whitefield preach during the Great Awakening → trace the triangle trade on a map → witness the Middle Passage through Olaudah Equiano's narrative → Franklin's Philadelphia and Enlightenment ideas.
- **Side quests:** the Salem witch trials of 1692; printer's apprentice job; the Zenger trial and freedom of the press; Eliza Lucas and indigo; the Stono Rebellion and the laws that followed.
- **Trial:** How did colonial society and trade depend on enslaved labor?

**Added from your Revolution reading:** core — a "Two Societies" comparison where Sivart visits London and the colonies and fills in how colonial life differed: no titled aristocracy, widespread property ownership, religious diversity, less poverty, few large cities, broad voting rights and less deference to authority, and the growing presence of slavery. This sets up the long-term causes Level 4's Trial will ask about.

#### Level 4 — The Road to the American Revolution

- **Map:** the Ohio frontier, Boston and its harbor, Lexington and Concord.
- **Main quest:** scout for young George Washington in the French and Indian War → the Proclamation of 1763 → a chain of tax acts (Sugar, Stamp, Townshend, Tea) as a "stamp collector" quest line → the Boston Massacre: a Weigh the Evidence trial rating seven exhibits from −2 to +2 → Boston Tea Party → the Intolerable Acts → the midnight ride and Lexington and Concord.
- **Side quests:** Pontiac's War; Daughters of Liberty spinning bee boycott; Committees of Correspondence courier runs; a Loyalist neighbor's point of view.
- **Lite combat:** stealth sections dodging patrols on the midnight ride (no fighting soldiers).
- **Trial:** How did tighter British control lead to armed conflict?

**Added from your test and DBQ:** core — the Chronicle Trial uses your Revolutionary War DBQ's eight documents; the First Continental Congress (boycott and petition) and Patrick Henry's "Give me liberty" speech come right before the midnight ride; the redcoats' target is the colonial weapons storehouse at Concord.

**Added from your Conflict Ignites and Lexington lessons:** core — Metaphor Match recaps the acts: picture cards show each act or protest as a metaphor (the Stamp Act, Sugar Act, Quartering Act, Proclamation of 1763, Intolerable Acts, Boston Massacre, Tea Party), the player names it, then builds a metaphor of their own. Side — History Mystery #2, "Who fired the first shot at Lexington?", unlocks after the midnight ride (see Your classroom activities). With these additions Level 4's main quest may run past one class period, so the mystery stays optional.

**Added from your Revolution reading and Taxing the Colonies simulation:** core — the tax-act chain adds the Currency Act, the Declaratory Act, admiralty courts that tried smugglers without juries, and the Quebec Act; Townshend revenue paying royal governors' salaries shows why colonists feared losing control of their own officials. The Trial now asks the player to use both long-term causes (Level 3) and triggering events (Level 4). Side — Franklin's suggestion to ship rattlesnakes to Britain in return for its convicts *(fun)*.

#### Level 5 — The American Revolution

- **Map:** Philadelphia, the Delaware River and Trenton, Saratoga, Valley Forge, Yorktown, Paris.
- **Main quest:** annotate Common Sense for bias, then hand it out → compare Jefferson's draft and final Declaration → cross the Delaware to Trenton → Saratoga as the turning point and the French alliance → survive Valley Forge (supply and drill minigame with von Steuben) → Yorktown → the Treaty of Paris and the new borders on the map.
- **Side quests:** Black Patriots and Black Loyalists explain their choices; Deborah Sampson; Native nations weigh alliances; Lafayette; news reaches Haiti *(loose tie-in)*.
- **Lite combat:** defend a supply wagon from Fade wisps in the snow.
- **Trial:** What obstacles did the Patriots face, and how did they still win?

**Added from standards:** core — Lafayette carries Revolutionary ideas home and Sivart sees the French Revolution begin in 1789 (8.1.3). Side — new state constitutions such as Virginia's Declaration of Rights and Massachusetts' 1780 constitution, and early state abolition in Pennsylvania and Massachusetts (8.3.1, 8.9.2).

**Added from your test and Debate It! cards:** core — the Second Continental Congress creates the Continental Army and sends the Olive Branch Petition; Bunker Hill; the fall of New York and Washington's retreat; the Southern campaign, with Francis Marion's guerrilla war, Kings Mountain, and Cowpens leading to Yorktown; a "thirds" scene showing Patriots, Loyalists, and neutral colonists. Side — Washington's spy ring (Abraham Woodhull and Anna Strong's laundry-line signals) as a stealth quest; the failed invasion of Canada, the hoped-for "14th colony"; the Patriots' tiny navy, privateers, and John Paul Jones; Benedict Arnold's betrayal; a Loyalist family uses Treaty of Paris Article V to try to reclaim its land.

**Added from your Conflict Ignites lesson:** core — Mr. Senoj opens with John Adams' idea that the real Revolution was in the minds of the people; Sivart talks to townspeople and sorts each into Patriot, Loyalist, or neutral with a reason, using the Perspective Lens. Side — a British officer asks Sivart to judge which colonist would make the best spy (trusted by Patriots, lives in a busy town, needs money or protection), paired with the Culper Ring quest so spying is seen from both sides; Ret Siger's fence-sitter poster quest.

### Act 2 — Building a New Nation

#### Level 6 — Creating the U.S. Constitution

- **Map:** a Massachusetts farm during Shays' Rebellion, the Philadelphia State House and taverns, a New York ratification hall.
- **Main quest:** list the Articles of Confederation's weaknesses as problems Sivart runs into (no tax power, no army, worthless money) → Shays' Rebellion → shadow one framer at the Convention (player picks Madison, Hamilton, Franklin, or a small-state delegate) → broker the Virginia vs. New Jersey Plans into the Great Compromise → witness the Three-Fifths Compromise and slave-trade clause → Federalist vs. Anti-Federalist town-hall debate for ratification.
- **Side quests:** the Northwest Ordinance surveyors and the Native nations already there; Abigail Adams' "remember the ladies"; hunt for the Federalist Papers' secret authors *(fun)*.
- **Trial:** Why did the Articles fail, and how did compromise create the Constitution?

**Added from standards:** core — a "Roots of Self-Government" puzzle linking the Magna Carta, English Bill of Rights, Mayflower Compact, civic republicanism, and classical liberalism to the Constitution (8.1.4, 8.2.1); delegates Roger Sherman, Gouverneur Morris, and James Wilson; the Federalist Papers by Madison, Hamilton, and Jay become a main-quest step (8.2.4); the debate over Native nations' status under the commerce clause (8.2.3); the Land Ordinance of 1785 township grid and the Northwest Ordinance's support for schools and ban on slavery (8.3.2, 8.9.3). Side — Jefferson's Virginia Statute for Religious Freedom and the founders' views on church and state (8.2.5).

#### Level 7 — The Constitution of the United States

The one level set mostly in the present: the Record shows Sivart his own town, so the Constitution feels like the rules of today.

- **Map:** a "Capitol District" with a Congress hall, a President's office, a Supreme Court, a state capitol, and a city hall.
- **Main quest:** walk a bill through Congress to become a law → use checks and balances to stop a branch that grabs too much power → sort powers into federal, state, and shared (federalism) → a Bill of Rights scavenger hunt where each amendment solves a problem in town → civic duties vs. responsibilities (jury duty, voting, community service).
- **Side quests:** Marbury v. Madison courtroom; the amendment process as a puzzle; run for student council *(fun)*.
- **Trial:** How does the Constitution limit power and protect rights?

**Added from standards:** core — enumerated vs. implied powers and the necessary and proper clause; dual sovereignty and majority rule with protected minority rights (8.2.7); the common market clauses (interstate commerce, common coinage, full faith and credit) as a trade quest between neighboring states (8.3.3); how citizens influence government through elections, parties, interest groups, and a free press (8.3.6, 8.3.7).

#### Level 8 — The Federalist Era

- **Map:** New York and Philadelphia as capitals, the Pennsylvania backcountry, an Atlantic port.
- **Main quest:** Washington's first cabinet → clerk between Hamilton and Jefferson (national bank, debt, strict vs. loose construction) → the Whiskey Rebellion → Washington's neutrality and the Farewell Address → the XYZ Affair → the Alien and Sedition Acts and the Kentucky and Virginia Resolutions → the first parties form.
- **Side quests:** Jay's Treaty protests; Benjamin Banneker surveys Washington, D.C.; a newspaper war between party presses *(fun)*.
- **Lite combat:** a ship escort during the Quasi-War with France (repel privateers).
- **Trial:** How did disagreements in Washington's and Adams' administrations create political parties?

**Added from standards:** core — the Battle of Fallen Timbers and the Treaty of Greenville with Northwest Indian nations (8.5.3); a free-press quest showing how the Sedition Act jailed newspaper editors (8.3.7).

### Act 3 — Growth and Westward Expansion

#### Level 9 — The Jefferson Era

- **Map:** the new capital of Washington, D.C., New Orleans, the Missouri River, the Rockies, the Pacific coast.
- **Main quest:** the election of 1800 as a peaceful transfer of power → Marbury v. Madison → Jefferson's dilemma: is the Louisiana Purchase constitutional? → join the Corps of Discovery with Lewis, Clark, York, and Sacagawea (map the route, trade with Native nations, log new species) → the War of 1812 and the burning of Washington.
- **Side quests:** Zebulon Pike's expedition; Tecumseh's confederacy; save Dolley Madison's portrait of Washington *(fun)*; species-journal collectible set *(fun)*.
- **Lite combat:** fend off a grizzly bear and river rapids on the expedition.
- **Trial:** How did the Louisiana Purchase and Lewis and Clark change the nation?

**Added from standards:** core — Jefferson's 1801 Inaugural Address (8.4.2); the full War of 1812: impressment, Tecumseh, Fort McHenry and the Star-Spangled Banner, the Battle of New Orleans, and the Treaty of Ghent (8.5.1); treaties with Native nations such as the Treaty of Fort Wayne (8.5.3); changing borders on the Map Room map, the Adams-Onís Treaty, the Monroe Doctrine, and John Quincy Adams' July 4, 1821 Address (8.5.2, 8.4.2). Side — a storytelling night with Washington Irving and James Fenimore Cooper and early American music and painting (8.4.4).

#### Level 10 — The Industrial Revolution and American Growth

- **Map:** Lowell, Massachusetts mills, the Erie Canal, a Georgia cotton field, a New York market.
- **Main quest:** geography check: why mills need fast rivers → Eli Whitney's cotton gin and interchangeable parts → work a shift as a Lowell mill worker (wages, bells, the 1834 and 1836 strikes) → ride the Erie Canal, steamboats, and early railroads → follow one bale of cotton from an enslaved worker's field to a Northern mill to a store shelf (capitalism and the connected economy).
- **Side quests:** Samuel Morse and the telegraph; Irish immigrants arrive; canal fishing minigame *(fun)*; invention workshop crafting *(fun)*.
- **Trial:** How did geography and inventions change the way Americans worked?

**Added from standards:** core — Henry Clay's American System (tariff, national bank, roads and canals) (8.6.2); how industry changed the land through deforestation, dams, farming, and mining (8.6.1); a Marshall Court courtroom trio (McCulloch v. Maryland, Dartmouth College v. Woodward, Gibbons v. Ogden) that protected contracts and a national economy (8.4.3).

#### Level 11 — The Jacksonian Era

- **Map:** the Tennessee frontier, a polling place, the White House, Cherokee Nation lands in Georgia.
- **Main quest:** the "corrupt bargain" of 1824 → campaign rally for 1828 and expanded white male suffrage (who still couldn't vote) → the spoils system → the Bank War → nullification crisis → the Cherokee fight in court (Worcester v. Georgia) → the Indian Removal Act and the Trail of Tears, told through Cherokee voices.
- **Side quests:** Sequoyah's syllabary; Alexis de Tocqueville interviews Americans; Jackson's inauguration party chaos *(fun)*.
- **Trial:** Was Jackson a champion of the common people? Whose?

**Added from standards:** core — the Webster-Hayne debate and John C. Calhoun's nullification argument, so the player hears both sides of state vs. federal power (8.10.1). Side — John Quincy Adams, back in Congress, fights the gag rule on antislavery petitions (8.9.1).

#### Level 12 — Manifest Destiny and Moving West

- **Map:** Independence, Missouri, the Oregon Trail, Mexican Texas and the Alamo, the Southwest, a California rancho, Sutter's Mill and San Francisco.
- **Main quest:** read John O'Sullivan and study American Progress to define Manifest Destiny → pack a wagon and survive the Oregon Trail → Texas independence and the Alamo from Tejano and Anglo views → Polk and the Mexican-American War → the Treaty of Guadalupe Hidalgo and what it meant for Mexican families → the Gold Rush and California statehood in 1850.
- **Side quests:** a Californio rancho family's land claim; Chinese miners and the Foreign Miners' Tax; the Mormon trek to Utah; gold-panning minigame *(fun)*.
- **Lite combat:** river crossings, wolves, and claim jumpers on the trail and in the gold fields.
- **Trial:** How did Manifest Destiny shape who gained and who lost in the West?

**Added from standards:** core — rivers and water rights in the dry West, with a quest dividing scarce water among settlers (8.8.4); pioneer women, Annie Bidwell, and Biddy Mason winning her freedom in California, plus Wyoming granting women the vote in 1869 (8.8.3); Mexico's 1829 abolition of slavery as a cause of conflict in Texas, and how Texas annexation reopened the slavery debate (8.8.5, 8.9.4).

### Act 4 — Regional Divisions and Social Change

Act 4 uses one connected open map (Northeast and South) that both levels share, so the regions can be compared side by side.

#### Level 13 — The North and South Diverge

- **Map:** a Northern factory city with immigrant neighborhoods, a railroad line south, a Southern port, a large plantation and a small farm, a free Black community in the South.
- **Main quest:** a side-by-side region comparison (population, cities, railroads, factories, crops) built as a journal chart → the North's factory and immigrant workforce → the cotton economy and "King Cotton" → daily life, family, faith, and culture in enslaved communities, told through narratives and spirituals → resistance: everyday acts and Nat Turner's rebellion, and the harsher laws that followed → free Black Southerners and their limits.
- **Side quests:** the Irish Famine "push" story; a Southern yeoman farmer's view; nature-mapping the Mississippi delta *(fun)*.
- **Trial:** How did slavery shape the South's economy and divide it from the North?

**Added from standards:** core — Richard Allen, the AME Church, and free Black Northerners building schools and churches, compared with the limits on free Black Southerners (8.6.4, 8.7.4); Denmark Vesey's planned revolt alongside Nat Turner (8.7.2); how climate and geography shaped white Southern society (8.7.3).

#### Level 14 — Social Reform and Culture

- **Map:** a camp-meeting revival, a Massachusetts schoolhouse, a prison and an asylum, Seneca Falls, an abolitionist print shop, an Underground Railroad route.
- **Main quest:** Charles Finney and the Second Great Awakening → temperance rally → Horace Mann's public schools and Dorothea Dix's reforms → the Seneca Falls Convention: compare the Declaration of Sentiments with the Declaration of Independence → abolitionists (Garrison, the Grimké sisters, Frederick Douglass, Sojourner Truth) → guide freedom seekers along an Underground Railroad map with Harriet Tubman.
- **Side quests:** transcendentalists at Walden Pond *(fun)*; Lowell Offering writing contest; Catharine Beecher and women's schools; set type for The North Star *(fun)*.
- **Lite combat:** stealth sections avoiding slave catchers on the Underground Railroad (evade, never fight).
- **Trial:** Why did reform movements rise, and how did they connect to each other?

**Added from standards:** side — Margaret Fuller and Susan B. Anthony join the women's rights quest line (8.6.6); a literary gallery with Emerson, Melville, Alcott, Hawthorne, and Longfellow (8.6.7); Theodore Weld's antislavery organizing (8.9.1).

### Act 5 — Sectional Crisis, Civil War, and Aftermath

#### Level 15 — The Impending Crisis

- **Map:** the Senate chamber, Boston streets, "Bleeding Kansas," the Supreme Court, Illinois debate stages, Harpers Ferry.
- **Main quest:** a timeline gauntlet where each event cracks the nation's map: Missouri Compromise review → Compromise of 1850 (Clay, Calhoun, Webster) → the Fugitive Slave Act and Boston's resistance → Uncle Tom's Cabin → Kansas-Nebraska Act and Bleeding Kansas → Dred Scott → Lincoln-Douglas debates → John Brown's raid → the 1860 election map.
- **Side quests:** the caning of Charles Sumner; the founding of the Republican Party; free-soil settler vs. proslavery settler in Kansas.
- **Trial:** Why did compromise fail by 1860?

**Added from standards:** core — the Wilmot Proviso and the States' Rights doctrine join the timeline gauntlet (8.9.5); California enters as a free state under the Compromise of 1850 (8.9.4); Lincoln's House Divided speech (8.10.4).

#### Level 16 — The Civil War Begins

- **Map:** Charleston and Fort Sumter, Washington, Richmond, Bull Run, the border states.
- **Main quest:** South Carolina's secession and the Confederacy forms → Fort Sumter → a resource-comparison "war room" (people, factories, railroads, navy, leaders) → the Anaconda Plan vs. Southern defensive strategy → First Bull Run → border states and the choice of sides.
- **Side quests:** a family split between Union and Confederacy; ironclads Monitor vs. Merrimack *(fun naval minigame)*; Mathew Brady's camera.
- **Lite combat:** naval blockade-runner chase (ships, not soldiers).
- **Trial:** What advantages did each side have at the start?

**Added from standards:** core — Lincoln's First Inaugural Address and its appeal to keep the Union (8.10.4).

#### Level 17 — Fighting the Civil War

- **Map:** Antietam, Vicksburg, Gettysburg, a contraband camp, a Northern factory town, a Richmond bread line, Appomattox.
- **Main quest:** Antietam and the Emancipation Proclamation → self-emancipation to Union lines and the 54th Massachusetts → Vicksburg splits the Confederacy → Gettysburg and the Gettysburg Address → the home front (draft riots, inflation, women nurses like Clara Barton and Mary Edwards Walker) → Sherman's March and Grant's campaign → Appomattox.
- **Side quests:** soldiers' letters from both sides; the Richmond bread riot; hardtack cooking *(fun)*.
- **Trial:** How and why did the war become a war to end slavery?

**Added from standards:** core — Lincoln's Second Inaugural Address (8.10.4); new war technology (rifled muskets, ironclads, railroads, the telegraph) and how the war damaged land, cities, and civilians and changed future warfare (8.10.6, 8.10.7).

#### Level 18 — The Reconstruction Era

- **Map:** a Southern town across 12 years, a Freedmen's Bureau school, Washington, D.C., a statehouse.
- **Main quest:** Lincoln's assassination → families reunite and the Freedmen's Bureau opens schools → Presidential vs. Congressional Reconstruction (Johnson vs. the Radical Republicans, impeachment) → the 13th, 14th, and 15th Amendments → Black officeholders such as Hiram Revels → the Compromise of 1877 and troops withdraw → Black Codes, sharecropping, and the rise of Jim Crow.
- **Side quests:** sharecropping contract math; Robert Smalls' story; letters searching for lost family members.
- **Trial:** How did Reconstruction redefine what it meant to be an American, and why did it end?

**Added from standards:** core — push and pull factors as freedpeople move to Northern cities and the West, including the Exodusters and the Buffalo Soldiers (8.11.2); the rise of the Ku Klux Klan and its violence against Black voters and officeholders, shown through testimony and documents only, never as gameplay (8.11.4).

#### Level 19 — The New West and Moving into the Industrial Age

- **Map:** railroad camps from Sacramento to Promontory Summit, the Great Plains, a cattle trail, Lakota and Nez Perce lands, a booming city.
- **Main quest:** build the Transcontinental Railroad with Chinese and Irish crews → the Homestead Act and sod-house settlers → cattle drives and cowboys (including Black and Mexican vaqueros) → the destruction of the buffalo → conflict with Native nations (Little Bighorn, Chief Joseph's surrender, Wounded Knee, boarding schools, the Dawes Act) → the frontier "closes" in 1890 → into the industrial boom (steel, oil, inventions).
- **Side quests:** Exodusters migrate to Kansas; a Wild West show *(fun)*; a chuckwagon cook-off *(fun)*.
- **Lite combat:** a train-robber chase and prairie wildlife.
- **Trial:** Who paid the price for the New West, and who profited?

### Act 6 (bonus) — The Industrial Age, Immigration, Labor, and the Progressive Era

The textbook stops at the start of the industrial boom, but standard 8.12 continues, so Act 6 adds three bonus levels (20–22) to cover the rest of it.

#### Level 20 — Industry and Big Business

- **Map:** a Pittsburgh steel mill, a Cleveland oil refinery, Edison's Menlo Park lab, a Kansas wheat farm, the 1893 Chicago World's Fair, Kitty Hawk.
- **Main quest:** build a resource map of where farming, mining, oil, steel, and lumber grew and why (climate, resources, markets, rail) → see how government boosted business through tariffs, banking, land grants, and railroad subsidies → Carnegie and the Bessemer steel process → Rockefeller's Standard Oil trust and how monopolies crushed rivals → Leland Stanford and the railroad barons in politics → an inventors' tour: Bell's telephone, Edison's light bulb, the Wright brothers' first flight → the 1893 World's Fair as a showcase of the new economy.
- **Side quests:** the Grange and the Populist Party fight for farmers; Carnegie's Gospel of Wealth and his libraries; a "robber baron or captain of industry?" Debate Duel; John Muir and the conservation movement at Yosemite; fly the Wright Flyer *(fun)*; ride the first Ferris wheel *(fun)*.
- **Trial:** Were the industrialists captains of industry or robber barons?

#### Level 21 — Immigration and the Growing City

- **Map:** a steamship in steerage, Ellis Island, a Lower East Side tenement, Angel Island and San Francisco's Chinatown, a Chicago neighborhood, a California farm worked by Japanese and Mexican families.
- **Main quest:** push and pull: meet newcomers from Italy, Poland, Russia, Greece, China, Japan, and Mexico and learn why each came → pass inspection at Ellis Island → tenement life through Jacob Riis' photographs → immigrants build the city (skyscrapers, the Brooklyn Bridge, subways, factories) → assimilation through public schools, settlement houses, and night classes → the new wave of nativism and the Chinese Exclusion Act of 1882, told through poems carved on Angel Island's walls.
- **Side quests:** Emma Lazarus and the Statue of Liberty; a Tammany Hall political boss trades favors for votes; Japanese farmers build California irrigation; stickball tournament and a pickpocket chase *(fun)*.
- **Lite combat:** chase a pickpocket through crowded streets.
- **Trial:** Who came to the United States, why did they come, and how were they welcomed or turned away?

#### Level 22 — Labor and the Progressive Era

- **Map:** a garment sweatshop, a coal mine, Homestead, Pennsylvania, Pullman, Illinois, Hull House in Chicago, a newspaper office, the White House.
- **Main quest:** work a shift beside child laborers (Lewis Hine's photographs) and learn laissez-faire and Social Darwinism as the excuses for it → the Knights of Labor and Samuel Gompers' AFL push for collective bargaining → strikes and protests: Haymarket, Homestead, Pullman → Jane Addams' Hull House → muckrakers: Ida Tarbell investigates Standard Oil, Upton Sinclair's The Jungle → Progressive reforms: Pure Food and Drug Act, meat inspection, child labor laws, Theodore Roosevelt's trust-busting and national parks.
- **Side quests:** Mother Jones' march of the mill children; the Triangle Shirtwaist fire and the safety laws that followed (serious tone); Hiram Johnson's reforms in California; the Spanish-American War and the Panama Canal as America steps onto the world stage *(loose tie-in)*.
- **Trial:** How did workers and reformers push government to respond to the problems of industry?

## The Ret Siger questline (secret true ending)

The Fade has erased the history sections from Thornton's master schedule, and the legendary history teacher Ret Siger has been scattered across time, still teaching wherever he lands. Finding his traces in every level and restoring his class periods is the hidden path to the game's true ending: Ret Siger teaching U.S. History again.

**How it works**

1. **Traces.** Every level hides Ret Siger signs: chalkboard doodles, a lesson plan pinned to a tavern wall, a bell schedule with "Period 4: History" scratched out, and margin notes in Archive Pages ("Source this! Who wrote it and why?"). Margin notes double as the game's hint system.
2. **Lost Lesson.** Each level has one Lost Lesson: a short, ridiculous, but real-content minigame Ret Siger is teaching to people in that era.
3. **Student Achievement.** Finishing the Lost Lesson unlocks a trophy describing an over-the-top achievement by one of his students, displayed in the Archive hub.
4. **Periods restored.** Completing all Lost Lessons in an act restores one class period to the Master Schedule (Periods 1–6 across Acts 1–6).
5. **True ending.** With all six periods restored, the Final Page changes: a last Debate Duel against the Fade's "Scheduler," where the player's evidence cards are Ret Siger's students' achievements. Win, and the closing scene is Ret Siger's classroom, full, with the credits rolling over student work.

**Tone rules.** Ret Siger is goofy everywhere except scenes about slavery, Indian removal, and violence; there his trace is quiet and serious (a lesson plan titled "Whose voices are missing?"), never a joke.

| Level | Ret Siger trace | Lost Lesson (minigame) | Student Achievement unlocked |
| --- | --- | --- | --- |
| 1 | Astrolabe engraved "R.S., Rm. ??" | Spice Route Speed Run: map trade routes against a timer | Apprentice draws the first map with a compass rose labeled "Mr. R" |
| 2 | A game of Settlers of America set up below deck on the Mayflower | History Mystery: The Lost Colony of Roanoke case file | Period 2's detectives crack the Roanoke case (or file the best report since 1590) |
| 3 | Poor Richard's Almanack: "Early to bed, early to rise, early to finish your DBQ" | The Salem Accusation Game: figure out why the accusations spread | Class finishes the Salem game without accusing the teacher |
| 4 | A bowl of candy at the docks labeled "Property of the King. Taxed." | The King's Candy: Parliament taxes what you're wearing, then you choose how to resist | Period 1 boycotts the candy tax so well Parliament repeals it |
| 5 | Ret Siger sitting on a literal fence outside Philadelphia, the colonies' most famous fence-sitter | Persuade the Fence-Sitter: design a propaganda poster with a metaphor and three key ideas to win Ret Siger to your side | "Taxes are the burnt crust on a yummy sandwich!" wins Ret Siger over (he still won't share the sandwich) |
| 6 | Margin doodle in Madison's notes: "Great discussion! 10/10 participation" | Compromise Jenga: build the Great Compromise without collapse | Class ratifies its own constitution faster than New York |
| 7 | A faded door sign in the present day: "U.S. History, Mr. Ret Siger" | Walk the "Bring Back History Class Act" through Congress | A student gets a law passed (in the game) |
| 8 | Discussion-board rules nailed to the cabinet room door | Moderate Hamilton vs. Jefferson using sentence starters | Hamilton and Jefferson both give the class an A, then argue about it |
| 9 | Lewis and Clark journal: "Met a man who insisted we add a map key" | Map Key Quest: complete the expedition map's legend | Student map so accurate Clark requests a copy |
| 10 | Lowell mill bell schedule with "Period 4: History" scratched out | Interchangeable Parts: assemble lesson plans on an assembly line | Class invents the five-paragraph essay machine |
| 11 | Campaign poster: "Vote Siger: History for the Common Student" | 1828 Election Bracket: an esports-style tournament of campaign issues | Student wins the bracket; Jackson demands a recount |
| 12 | An arcade cabinet in a Gold Rush saloon | Panning for Primary Sources: sift gold from fool's-gold sources | Class strikes the richest vein of evidence in California |
| 13 | Chalk comparison chart on a Northern factory wall | North vs. South chart-builder | Student chart reprinted in a newspaper |
| 14 | Petition at Seneca Falls: "Free public history for all" | Reform Rally: match reformers to their causes | Horace Mann declares history a required subject |
| 15 | Ret Siger is the timekeeper at a Lincoln-Douglas debate | Debate Duel practice round | Student out-debates Stephen Douglas (in the game) |
| 16 | His class's resource chart pinned in Lincoln's war room | Resource Showdown card game | Lincoln uses the class chart in a cabinet meeting |
| 17 | A student memorizing the Gettysburg Address in the crowd | Speech Remix: put the address's ideas in order | Student recites it perfectly, ahead of the speech (oops) |
| 18 | Lesson plans left for Eli at a Freedmen's Bureau school (serious tone) | Help Eli teach a reading lesson | Eli's students write letters that reunite a family |
| 19 | A golden pencil next to the golden spike | Railroad Route Puzzle: connect the lines | Class lays track faster than the Central Pacific |
| 20 | A light bulb in Edison's lab tagged "Bright idea: bring back history class" | Invention Expo: match inventors to inventions and how they improved daily life | Student's invention wins a blue ribbon at the 1893 World's Fair |
| 21 | A citizenship-test study guide in Ret Siger's handwriting at Ellis Island | Citizenship Quiz Show | A newcomer aces the citizenship test using the class flashcards |
| 22 | A muckraking article: "The Case of the Missing History Sections" | Muckraker Investigation: gather evidence on the Fade's Scheduler | Class exposé reveals the Fade and unlocks the true-ending Debate Duel |

The Mayflower trace is a cameo of the Settlers of America class game, which is also playable as a Level 2 minigame.

## Your classroom activities in the game

Seven of your past lessons become game systems or quests, mostly in Act 1. Most of them are also Ret Siger's Lost Lessons, so the hidden teacher is literally teaching your real lessons. Two of them, Weigh the Evidence and Settlers of America, become systems the whole game reuses.

| Your activity | How it worked in class | In the game | Where |
| --- | --- | --- | --- |
| Weigh the Evidence: Boston Massacre | Rate exhibits from −2 to +2 on a claim, total the score, write a claim with three pieces of evidence (CER in the game) | Becomes the core evidence system: every Archive Page can be weighed on a claim, and every Chronicle Trial uses the Claim–Evidence–Reasoning (CER) frame with three pieces of evidence. Level 4's Boston Massacre trial uses your exhibits: John Adams' defense, Samuel Adams, Revere's engraving, the 1868 Chappel etching, Preston's deposition, witness depositions, and a video-game clip as a low-weight "fiction" exhibit | Level 4 core; game-wide system |
| The King's M&M's (Stamp Act) | Parliament draws item cards; students wearing that item pay candy to collectors; King and Parliament keep the take | Ret Siger's Lost Lesson: Parliament taxes items in Sivart's inventory (boots, paper, tea), collectors take coins, the King's pile grows, then the player picks a response: boycott, petition, or Sons of Liberty protest | Level 4 Ret Siger |
| Historical Analysis: Common Sense | Read Paine excerpts, annotate with symbols (! = + ? ☺ ☹), identify bias, answer six questions, earn XP | A core quest: Sivart annotates Common Sense excerpts with the same symbols and tags where Paine uses logic vs. emotion to find his bias | Level 5 core |
| Settlers of America | Groups found a colony (location, name, 3 laws), then each season choose an action (farms, envoy to Britain, school or hospital) and face random events | A persistent colony sim across Act 1: found your colony in Level 2, and its events fire as levels go on (tobacco boom, religious revival tests whether you built a school, sickness tests the hospital, a pamphlet arrest, and finally signing the Declaration) | Starts Level 2, runs through Level 5 |
| History Mystery: Roanoke | Students act as detectives using a crime report, journals, an interrogation transcript, Drake's letter, later sightings, and surname lists | A detective case-file quest with an evidence board; becomes a reusable "History Mystery" format for other unsolved questions | Level 2, Ret Siger Lost Lesson |
| Mapping the New World | Compare 1636 and 1651 maps of Virginia with a historical-context timeline: why do maps change? | Opens the Map Room: Sivart compares the two maps and links the differences to events like the 1622 attacks and the 1634 wall | Level 2 core |
| Salem Witch Trial Game | Mafia-style hidden roles (witch, judges, doctor, townspeople) with day accusations and votes | A single-player adaptation: Sivart lives through 1692 Salem as accusations spread among NPCs; he can't stop history but gathers evidence on why accusers were believed and why some confessed | Level 3 side quest and Ret Siger Lost Lesson |
| Debate It! card game | Apples-to-Apples style: roll a D20 for a quality (heroic, costly, misunderstood...), play history cards, argue "\_\_\_ was more heroic than \_\_\_"; about 150 cards in three sets (Revolution, Constitution, New Republic) | Becomes the Debate Duel engine: a D20 rolls the quality, both sides play cards from the player's Historidex, and the player wins by picking the stronger evidence. Your card blurbs become the Historidex entries for Acts 1–3 | Game-wide system; cards for Levels 2–9 |
| Revolutionary War DBQ | Eight documents with short-answer questions, then an essay: how did tighter British control lead to revolution? | Its eight documents (Grenville's speech, the 1764–1776 imports chart, Washington's letter to Bryan Fairfax, Revere's engraving, the Quartering Act, the Stamp Act, the Proclamation Line map, the tea boycott) become Level 4's Archive Pages, and its essay question becomes Level 4's Chronicle Trial | Level 4 core |
| Revolution unit test | 30 multiple-choice, true/false, and matching questions plus three short essays on the colonies and the Revolution | Becomes the Study Mode question bank for Levels 2–5; its essays become the Level 4 and Level 5 Trial questions; topics the levels missed were added (see Review check below) | Study Mode, Levels 2–5 |
| Sample AP DBQ (another teacher's) | Was the Revolution truly revolutionary? Uses Galloway's Plan of Union, the First Continental Congress resolves, Patrick Henry, and Treaty of Paris Article V | Source ideas only: the First Continental Congress resolves and Patrick Henry's "Give me liberty" speech join Level 4; Treaty of Paris Article V powers a Level 5 side quest about a Loyalist family trying to get its property back | Levels 4–5 |
| The Conflict Ignites! (Patriot, Loyalist, or Neutral?) | Metaphor tableau cards for the acts and protests; sort colonists' biographies into Patriot, Loyalist, or neutral; recruit a spy for the British using three criteria; make a propaganda poster with a metaphor to win over Mr. Register, a neutralist | Four pieces: Metaphor Match (Level 4 recap of the acts); a Patriot/Loyalist/Neutral sorting quest with townspeople (Level 5 core); a spy-recruiting side quest paired with Washington's Culper Ring (Level 5); and the poster becomes Ret Siger's Level 5 Lost Lesson, where Ret Siger is literally the neutral fence-sitter you must persuade | Levels 4–5, Ret Siger |
| Lexington CSI File | Historical scene investigation: eight accounts (Massachusetts Provincial Congress, 34 minutemen's deposition, a 1961 novel, Lt. Barker's diary, the London Gazette, Ezra Stiles' diary, a 1963 textbook, Ensign Lister) answer "Who fired the first shot?" with a written claim | The second History Mystery case, unlocked right after the midnight ride: an evidence board where the player sorts the accounts by side, date, and type, weighs them, and writes a CER answer. The 1961 novel and 1963 textbook are still under copyright, so the game swaps in its own invented "historical novel" and "old textbook" exhibits that teach the same lesson | Level 4 side (History Mystery) |
| Taxing the Colonies! (student simulation) | A surprise "memorandum" charged students 5 AP for items they didn't have; afterward a two-column chart matched each classroom experience to the historical reality (no consultation = no voice in Parliament, paying out of fear, IOUs and dodging = smuggling) | Folds into Ret Siger's King's Candy lesson: the player can pay, pay out of fear of punishment, hand over an IOU, or smuggle, and each choice has a consequence. It ends with your "Classroom vs. Reality" chart, where the player matches each moment of the game to what really happened, then answers your debrief questions | Level 4 Ret Siger |
| Why did the American Revolution take place? (reading) | A Digital History reading splitting causes into long-term differences between colonial and British society and a 1733–1776 timeline of precipitating events | Gives the game its cause framework: Level 3 shows the long-term differences, Level 4 the triggering events, and the Level 4 Trial asks players to use both. The reading is copyrighted, so the game uses its ideas and facts, not its text | Levels 3–4 |

**Adaptation notes**

- Your Roanoke deck mixes real sources with paraphrased or invented testimony (you note this on the slides). In the game, each exhibit is labeled primary, paraphrased, or invented, which itself becomes a sourcing lesson.
- Settlers of America's "Native army at your border" event becomes a diplomacy event (alliance, trade, treaty, or broken promise) so Native nations aren't only a threat.
- The King's M&M's comes from a published book (Teacher Created Resources). The game borrows only the mechanic, not its text.
- The Patriot/Loyalist deck opens with John Adams' 1815 line that the war was only an effect of the Revolution, which happened in the minds of the people; that idea becomes Mr. Senoj's briefing for Level 5.
- Your decks already award XP ("50XP"), so Historian Rank fits how your class worked.

### Review check: Revolution unit test

Most of the test was already covered by Levels 2–5. These test topics were missing and are now added to the levels:

| Test question | Topic | Added to |
| --- | --- | --- |
| 2 | Maryland's Toleration Act of 1649 | Level 2 |
| 5, 23 | Headright system; indentured servants' 7-year contracts | Level 2 |
| 7 | Second Continental Congress creates the Continental Army | Level 5 |
| 8 | British target: the weapons storehouse at Concord | Level 4 |
| 6 | Patriots' weakness at sea | Level 5 |
| 15, essay 1 | Southern campaign and Francis Marion's guerrilla war | Level 5 |
| 19 | Patriots, Loyalists, and neutral colonists | Level 5 |
| 24, 27 | Fall of New York and Washington's retreat | Level 5 |
| 26 | Canada as the hoped-for "14th colony" | Level 5 |
| essays 2–3 | Why tensions became war; Patriot obstacles | Level 4 and 5 Trials |

One answer-key note: question 19's "30% undecided" reflects a common textbook estimate, but historians' estimates of neutral colonists vary, so the game will teach it as "roughly a third" with the uncertainty named.

## Standards cross-check

Most of the [CA Grade 8 content standards](https://www.cde.ca.gov/be/st/ss/documents/histsocscistnd.pdf) were already covered by the textbook-based levels; the gaps below were found and added, either to the main quest (core) or as side quests. Each level now has an "Added from standards" line showing them in place.

| Standard | What was missing | Added to | Type |
| --- | --- | --- | --- |
| 8.1.3 | How the Revolution affected France | Level 5 | Core |
| 8.1.4, 8.2.1 | Civic republicanism, classical liberalism, English parliamentary roots; Magna Carta and English Bill of Rights | Level 6 | Core |
| 8.2.3 | Status of American Indian nations under the commerce clause | Level 6 | Core |
| 8.2.4 | Federalist Papers authors; Sherman, Gouverneur Morris, James Wilson | Level 6 | Core |
| 8.2.5 | Jefferson's Statute for Religious Freedom; separation of church and state | Level 6 | Side |
| 8.2.7 | Enumerated vs. implied powers, dual sovereignty, majority rule | Level 7 | Core |
| 8.3.1, 8.9.2 | State constitutions of 1776–1781; early state abolition | Level 5 | Side |
| 8.3.2, 8.9.3 | Land Ordinance of 1785; Northwest Ordinance on schools and slavery | Level 6 | Core |
| 8.3.3 | Common market: interstate commerce, common coinage, full faith and credit | Level 7 | Core |
| 8.3.6, 8.3.7 | Citizen influence through parties and interest groups; role of a free press | Level 7, Level 8 | Core |
| 8.4.2 | Jefferson's 1801 Inaugural; John Quincy Adams' July 4, 1821 Address | Level 9 | Core |
| 8.4.3 | Marshall Court decisions protecting contracts and capitalism | Level 10 | Core |
| 8.4.4 | Early national art, music, literature (Irving, Cooper) | Level 9 | Side |
| 8.5.1, 8.5.2 | Full War of 1812 (causes, battles, Treaty of Ghent); Monroe Doctrine; changing borders | Level 9 | Core |
| 8.5.3 | Treaties with American Indian nations under the first four presidents | Levels 8, 9 | Core |
| 8.6.1, 8.6.2 | Human changes to the landscape; Henry Clay's American System | Level 10 | Core |
| 8.6.4, 8.7.4 | Free Black Northerners founding schools and churches; compared with free Black Southerners | Level 13 | Core |
| 8.6.6, 8.6.7 | Margaret Fuller, Susan B. Anthony; American writers and artists | Level 14 | Side |
| 8.7.2 | Denmark Vesey | Level 13 | Core |
| 8.8.3 | Pioneer women; Biddy Mason; Wyoming women's suffrage in 1869 | Level 12 | Core |
| 8.8.4 | Great rivers and the struggle over water rights | Level 12 | Core |
| 8.8.5, 8.9.4 | Mexican attitudes toward slavery; slavery and the annexation of Texas | Level 12 | Core |
| 8.9.1 | John Quincy Adams' antislavery fight; Theodore Weld | Levels 11, 14 | Side |
| 8.9.5 | Wilmot Proviso; States' Rights doctrine | Level 15 | Core |
| 8.10.1 | Webster vs. Calhoun on state and federal power | Level 11 | Core |
| 8.10.4 | House Divided speech; first and second inaugural addresses | Levels 15–17 | Core |
| 8.10.6, 8.10.7 | War technology; effects on civilians, environment, future warfare | Level 17 | Core |
| 8.11.2 | Push-pull migration of freedpeople north and west; Buffalo Soldiers | Level 18 | Core |
| 8.11.4 | Rise of the Ku Klux Klan and its effects | Level 18 | Core (serious tone, no gameplay) |
| 8.12.1–8.12.9 | Industry, business and government, immigration, nativism, labor, Grange and Populists, inventors | Levels 20–22 | Core |

The Grade 8 course description says the course runs "up to World War I"; there is no numbered WWI standard, so it appears only as a short epilogue scene in Level 22 if you want it.

## Characters

A small fictional cast gives the game continuity, a companion per act gives a ground-level view of that era, and real historical figures give quests their content.

| Character | Type | Role in the game |
| --- | --- | --- |
| Sivart | Player | Present-day 8th grader; witness and recorder; carries the Living Record |
| Mr. Senoj (Graham Senoj) | Fictional, recurring | Keeper of the Record; hub mentor; briefs each level so any order works |
| Act 1 companion: Kit | Fictional composite | Boston printer's apprentice; grows up across Levels 3–5 |
| Act 2 companion: Hannah | Fictional composite | Philadelphia tavern-keeper's daughter who hears every Convention secret |
| Act 3 companion: Mateo | Fictional composite | Californio rancher's son whose family's land and rights are at stake in Level 12 |
| Act 4 companion: Ruth | Fictional composite | Lowell mill worker turned reform writer |
| Act 5 companion: Eli | Fictional composite | Free Black teenager from Philadelphia who enlists, then teaches at a Freedmen's Bureau school |
| The Fade | Antagonistic force | Erases perspectives; grays out NPCs and documents; appears as wisps in lite combat |
| Everyday people | Composites | Farmers, workers, soldiers, enslaved and free Black Americans, Native community members, immigrants; most side quests start with them |
| Act 6 companion: Sal | Fictional composite | Italian immigrant newsboy in New York who knows every street, strike, and scoop |
| Ret Siger | Fictional, hidden | Legendary history teacher lost in time; his traces drive the secret true ending |

**Historical figures by act (starting list)**

- **Act 1:** Mansa Musa, Prince Henry the Navigator, Tisquantum, William Bradford, John Winthrop, Pocahontas, Samuel de Champlain, Roger Williams, Anne Hutchinson, George Whitefield, Benjamin Franklin, Olaudah Equiano, Eliza Lucas, Pontiac, Samuel Adams, Paul Revere, Thomas Paine, Thomas Jefferson, George Washington, Deborah Sampson, Lafayette.
- **Act 2:** James Madison, Alexander Hamilton, John Adams, Abigail Adams, Daniel Shays, Patrick Henry, Benjamin Banneker, John Marshall.
- **Act 3:** Meriwether Lewis, William Clark, Sacagawea, York, Tecumseh, Dolley Madison, Eli Whitney, Francis Cabot Lowell, Andrew Jackson, John Ross, Sequoyah, James K. Polk, Juan Seguín, Santa Anna, John Sutter.
- **Act 4:** Nat Turner, Frederick Douglass, Harriet Tubman, Sojourner Truth, William Lloyd Garrison, the Grimké sisters, Charles Finney, Horace Mann, Dorothea Dix, Elizabeth Cady Stanton, Lucretia Mott, Henry David Thoreau.
- **Act 5:** Henry Clay, Harriet Beecher Stowe, Dred Scott, Stephen Douglas, John Brown, Abraham Lincoln, Jefferson Davis, Ulysses S. Grant, Robert E. Lee, Clara Barton, Mary Edwards Walker, Andrew Johnson, Thaddeus Stevens, Hiram Revels, Robert Smalls, Chief Joseph, Sitting Bull.

* **Act 6:** Andrew Carnegie, John D. Rockefeller, Leland Stanford, Thomas Edison, Alexander Graham Bell, the Wright brothers, John Muir, Jacob Riis, Jane Addams, Samuel Gompers, Mother Jones, Ida Tarbell, Upton Sinclair, Theodore Roosevelt, Hiram Johnson.
* **Hidden:** Ret Siger, legendary history teacher (see the Ret Siger questline).

Companion names are placeholders to rename freely.

## Game systems

Core mechanics are historical thinking skills, wrapped in a Stardew Valley / Pokémon-style top-down world with lite combat and collectibles for replay.

**Learning systems**

| System | What the player does | Skill practiced |
| --- | --- | --- |
| Archive Pages | Collect primary-source excerpts in the world; tag author, date, audience, and purpose before each unlocks, then weigh it on a claim from −2 to +2 | Sourcing; evidence and point of view |
| Living Record (journal) | Auto-logs events, people, and vocabulary; player writes a one-line "why it mattered" for key events | Significance; recall |
| Perspective Lens | See a scene through another person's eyes; faded NPCs speak only after Sivart hears an opposing view | Multiple perspectives |
| Debate Duels | Pokémon-style turn-based debates: play evidence cards against an opponent's claims; strong evidence beats weak | Claim and evidence |
| Map Room | Place routes, territories, and battles on period maps to open fast travel | Chronological and spatial thinking |
| Timeline Weave | Order events and link causes to effects to repair torn pages | Cause and effect |
| Chronicle Trial | Level finale: weigh the evidence, pick 3 Archive Pages, and answer the level question as a CER response: a claim, three pieces of evidence, and reasoning that connects them, saved in the game | Interpretation; writing |
| Study Mode | Vocabulary flashcards, key-people cards, and a timeline drill per level, built from what the player has collected | Review for tests at home |

**Play systems**

| System | How it works | Guardrail |
| --- | --- | --- |
| Lite combat | Simple real-time action in some levels and side quests: wildlife, pirates, bandits, claim jumpers, storms, Fade wisps | Never against real historical groups; stealth and evasion instead around soldiers and slave catchers |
| Historidex | A Pokédex-style collection of historical figures met, each with a short bio card and quote | Facts only from sources |
| Minigames | Farming with Tisquantum, canal fishing, gold panning, typesetting, wagon packing, ironclad battle | Each has a one-line history tie-in |
| Historian Rank | XP from quests, Trials, and collections unlocks tools: magnifying glass, extra Lens slot, faster travel, outfits | Cosmetic and convenience only |
| Archive hub | Sivart's base: decorate with era trophies, display collected artifacts | (fun) |

Trial responses and progress stay in the game; nothing is sent to the teacher.

## Decisions and open questions

| Topic | Decision |
| --- | --- |
| Platform | Browser game for school Chromebooks (HTML/JS, likely Phaser); desktop build possibly later |
| Look | Top-down 2D pixel art, Stardew Valley / Pokémon feel |
| Sivart | Present-day student pulled into the past |
| Level order | Free choice from the Archive, with a "suggested next" marker in textbook order |
| Length | Open-ended; main quest fits one 50-minute period, side content for home and study |
| Trial responses | Stay in the game |
| Structure | 5 Acts and 19 Levels matching IMPACT: California, Grade 8, plus bonus Act 6 (Levels 20–22) for the rest of 8.12 |
| Combat | Lite, mostly in side quests; fictional threats only |
| Saving | Autosave on the device plus a copy-and-paste save code to move between school and home (see Save system) |
| Art | Free CC0 base tileset to start, with era-specific art designed by you and students (see Art plan) |
| Prototype | Level 4, The Road to Revolution, built fully polished first |
| World War I | Not included; the game ends with Level 22 |
| Class games | Settlers of America folded into Level 2 as a minigame and Ret Siger cameo |

**Still open**

- [ ] Rename companions (Kit, Hannah, Mateo, Ruth, Eli, Sal) and confirm each level's side-quest list.
- [ ] Confirm Level 2 is the right home for Settlers of America.
- [ ] Check district policy on crediting student-made art in a published game.

**Next steps**

- [ ] Write Level 4's script: Mr. Senoj's briefing, dialogue for each main-quest beat, and NPC lines for the side quests.
- [ ] Choose Level 4's remaining Archive Pages; the Boston Massacre exhibits come from your Weigh the Evidence deck, so add the Proclamation of 1763, the Stamp Act, a Pontiac speech, and Revere's account of his ride, and write their sourcing tags.
- [ ] Write the Level 4 Debate Duel cards, Timeline Weave events, Chronicle Trial prompt, and a simple scoring guide.
- [ ] Write a character voice guide for Sivart, Mr. Senoj, Kit, and Ret Siger so dialogue stays consistent across levels.
- [ ] Sketch the three Level 4 maps (paper or Tiled) with quest locations marked.
- [ ] Set up the build: a GitHub repo, free hosting such as GitHub Pages, and a check that the district web filter allows the game's URL on Chromebooks.
- [ ] Export this bible to Markdown as the project brief for Claude Code.
- [ ] Set reading supports: plain-language dialogue, a tap-to-define glossary, adjustable text size.
- [ ] Pick the Lospec palette and starter pack, and build the Piskel templates.
- [ ] Plan a student playtest of Level 4 with a short feedback form.

## Art plan

Start Level 4 on a free CC0 base tileset so building isn't blocked by art, then swap in era-specific art that you and students design against one shared style guide. Grass, water, and dirt can stay generic; people, buildings, and artifacts are where custom art pays off.

**Style guide (everyone draws to this)**

| Spec | Value |
| --- | --- |
| Tile size | 16 × 16 px, scaled up 3–4× in game |
| Characters | 16 × 32 px; 4 directions × 3 walk frames plus 1 idle frame |
| Portraits | 48 × 48 px for dialogue boxes and Historidex cards |
| Item icons | 16 × 16 px (Archive Pages, artifacts, collectibles) |
| Palette | One shared limited palette from Lospec (about 32 colors), loaded into every template |
| Look | 1-px dark outline on characters, light from the top left, no gradients |
| Files | PNG sprite sheets, named `level_asset_frame.png`, no resizing before export |

**Tools**

- Chromebooks: Piskel and Lospec Pixel Editor are free and run in the browser.
- Classroom desktops: Aseprite (paid) or LibreSprite (free) for animation, and Tiled (free) for building maps.

**Free starter packs** (check each license; CC0 needs no credit, CC-BY needs credit, CC-BY-SA also requires sharing changes alike)

- Kenney.nl RPG and town packs (CC0).
- Ninja Adventure asset pack on itch.io (CC0); its top-down style matches the Stardew/Pokémon target.
- OpenGameArt's LPC sets, a large shared library, but CC-BY-SA, so credit and share-alike rules apply.

**Student design workflow**

1. **Art commission board.** Each needed asset gets a short brief card: name, size, frame count, palette, and 1–2 reference images from the Library of Congress or National Archives.
2. **Templates.** Students start from a blank file with the grid size and palette already set, so every sprite matches.
3. **Research first.** Students sketch from period images (clothing, buildings, ships) before drawing, which makes the art itself a primary-source exercise.
4. **Pairs.** One artist, one historian who fact-checks details like uniforms and architecture.
5. **Review gate.** Each asset passes a style check (size, palette, outline) and an accuracy check before it goes into the game.
6. **Credits.** Student artists appear in the credits and on a "Gallery" wall in the Archive hub, following district policy on names.

Good student sources: a game-art mini-unit in a design or game-design class, the esports club, or an after-school class. Easy first commissions: Historidex portraits of historical figures, building fronts for colonial Boston, and artifact icons.

**Level 4 starter asset list**

- Tilesets: Boston streets and brick buildings, Long Wharf and harbor ships, Ohio frontier forest and Fort Necessity, Lexington green and farmhouses.
- Characters: Sivart, Kit, Mr. Senoj, Ret Siger, young George Washington, Samuel Adams, Paul Revere, a redcoat patrol, Daughters of Liberty, a Loyalist neighbor, Boston townspeople.
- Items: tea chest, tax stamp, Revere's lantern, Archive Page scroll, Committee of Correspondence letter.

## Prototype: Level 4

Level 4, The Road to the American Revolution, is built first and fully polished, so it proves every core system once before the other 21 levels reuse them. It is done when a student can play from the Archive to the Chronicle Trial in about one 50-minute period, and a save code carries progress from a school Chromebook to a home computer.

| System | What Level 4 includes |
| --- | --- |
| World | Archive hub (stub), Ohio frontier, Boston and the harbor, the road to Lexington and Concord |
| Main quest | All beats: French and Indian War scout → Proclamation of 1763 → tax acts → Boston Massacre sources → Tea Party → Intolerable Acts → midnight ride |
| Side quests | Pontiac's War, Daughters of Liberty spinning bee, Committees of Correspondence courier, Loyalist neighbor |
| Learning systems | Archive Pages with sourcing tags, Living Record, the Weigh the Evidence Boston Massacre trial, one Perspective Lens scene, Timeline Weave (tax acts), one Debate Duel (Patriot vs. Loyalist), Chronicle Trial |
| Play systems | Stealth on the midnight ride, Historidex entries, one minigame (tea chest toss) |
| Ret Siger | Trace, "The King's Candy" Lost Lesson, Student Achievement trophy |
| Study Mode | Level 4 vocabulary and key-people cards |
| Saving | Autosave and save code |

**Build milestones in Claude Code**

1. Engine skeleton: Phaser project, top-down movement, Tiled map loading, collisions, camera, dialogue box, JSON content loader.
2. Archive hub stub, level select, autosave, and save code.
3. Level 4 maps with CC0 placeholder art, NPCs placed, main quest beats running from JSON.
4. Learning systems: Archive Pages, journal, Perspective Lens, Timeline Weave, Debate Duel, Chronicle Trial.
5. Side quests, Ret Siger content, minigame, stealth section, Study Mode.
6. Art pass replacing placeholders with custom and student art; sound.
7. Student playtest, fix list, then reuse the systems for the next level.

## Claude Code handoff notes

Keep all history content in data files separate from game code, so Claude Code builds one Phaser engine and you add levels, quests, and sources by editing JSON. Maps can be drawn in the free Tiled editor and loaded by Phaser.

Suggested content folder:

```
content/
  acts.json               # 5 acts: name, unit, companion, level list
  levels/L05.json         # textbook chapter, focus, standards, map, quest list, trial
  quests/L05_*.json       # beats, NPCs, required sources, rewards
  npcs/*.json             # name, real/composite, era, sprite, dialogue file
  dialogue/*.json         # branching nodes with claim/evidence choices
  debates/*.json          # Debate Duel opponents, claims, evidence cards
  sources/*.json          # Archive Pages: excerpt, author, date, citation, tags
  encounters/*.json       # lite combat: enemy type, level, spawn area
  minigames/*.json        # minigame configs and history tie-in text
  study/L05_vocab.json    # Study Mode terms and definitions
maps/                     # Tiled (.tmj) maps and pixel tilesets per level
```

Example source record:

```json
{
  "id": "src_declaration_preamble",
  "title": "Declaration of Independence, preamble",
  "author": "Thomas Jefferson et al.",
  "date": "1776-07-04",
  "type": "document",
  "excerpt": "...",
  "citation": "National Archives",
  "standards": ["8.1"],
  "perspective": "Patriot leaders",
  "act": 1,
  "level": 5
}
```

Every quest, source, and Trial carries a `standards` tag so the game can show which standards a student has reviewed and so Review Mode can filter by standard.

### Save system

The game autosaves to the browser after every quest step, and a save code moves progress between devices with no accounts or server, which keeps it simple to build.

1. **Autosave:** progress is written to the browser's local storage on that Chromebook or computer.
2. **Get save code:** the pause menu turns progress into a text code with a Copy button; students paste it anywhere (a Google Doc, an email to themselves).
3. **Load save code:** on another device, the title screen has a box to paste the code and continue.
4. **Keep it short:** the save stores IDs and flags (quests done, pages collected, trophies), not text; Chronicle Trial answers are capped in length so codes stay a manageable size.
5. **Safety checks:** each code carries a version number and a checksum, so a mistyped or outdated code shows a friendly error instead of breaking the game.

```json
{
  "v": 1,
  "levels": { "L04": { "quests": ["q1", "q2"], "trial": "done" } },
  "pages": ["src_stamp_act", "src_revere_engraving"],
  "retSiger": { "L04": true },
  "periods": 0
}
```

The JSON is compressed (for example with the free LZ-String library) into a single line of letters and numbers. Students could edit their own codes to cheat, but since nothing is graded in the game, that is an acceptable trade-off for the simplicity.

## Sources

- [California History–Social Science Framework, Chapter 12: Grade Eight](https://www.cde.ca.gov/ci/hs/cf/documents/hssfwchapter12.pdf)
