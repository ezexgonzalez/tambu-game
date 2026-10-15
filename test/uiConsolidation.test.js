import test from 'node:test';
import { registerHooks } from 'node:module';
import assert from 'node:assert/strict';
import { makeUiScene, assertUiFits } from '../test-support/uiScene.js';
import { createHud } from '../src/ui/createHud.js';
import { createGameState } from '../src/state/gameState.js';
import { patioWomen } from '../src/data/patioCharacters.js';
import { createDialogueQuestionUi, createDialogueReactionUi, createCouncilSelectionUi,
  createCouncilAdviceUi, createOutcomeUi, destroyDialogueUi } from '../src/ui/dialogueUi.js';
import { createOutcomeEventUi, createBathroomChallengeUi } from '../src/ui/eventUi.js';
import { getBathroomResistanceConfig } from '../src/events/bathroomResistance.js';
import { getBathroomResistanceNarrative } from '../src/data/bathroomResistanceNarrative.js';
import { createPixelText } from '../src/ui/pixelText.js';
import { formatOutcomeReward } from '../src/ui/uiTheme.js';

const viewports = [[1280,720],[960,540]];

test('HUD updates lives/points only, retains hidden state, gates one prompt and cleans on shutdown', () => {
  for(const [width,height] of viewports) {
    const scene=makeUiScene(width,height), state=createGameState(), before=structuredClone(state);
    state.player.alcohol=100;
    const hud=createHud(scene,state);
    assert.ok(scene.objects.every(o=>!String(o.text).includes('ALCOHOL') && !/[♥★]/u.test(o.text)));
    assert.equal(scene.objects.find(o=>o.text==='VIDAS 3').visible,true);
    assert.equal(scene.objects.find(o=>o.text==='PUNTOS 0000').visible,true);
    assert.equal(hud.interactionPrompt.visible,false);
    state.player.lives=0; state.player.points=123456;
    hud.update(state);
    assert.ok(scene.objects.some(o=>o.text==='VIDAS 0'));
    assert.ok(scene.objects.some(o=>o.text==='PUNTOS 123456'));
    hud.interactionPrompt.setText('E · HABLAR CON SOFI').setVisible(true);
    assertUiFits(assert,scene);
    hud.setVisible(false); hud.update(state); hud.interactionPrompt.setVisible(true);
    assert.ok(scene.objects.every(o=>!o.visible));
    hud.setVisible(true); assert.equal(hud.interactionPrompt.visible,false);
    assert.deepEqual(state.relationships,before.relationships); assert.equal(state.player.alcohol,100);
    scene.events.emit('shutdown'); hud.destroy();
    assert.ok(scene.objects.every(o=>o.destroyCount===1));
    assert.equal(scene.events.listenerCount('shutdown'),0);
  }
});

test('pixel labels redraw in place, refit changing scores and do not leave old glyphs', () => {
  const scene=makeUiScene();
  const label=createPixelText(scene,'1',{x:110,y:50,cellSize:4,maxWidth:160,align:'right'});
  const first=label.rectangles.length;
  label.setText('100000'); assert.equal(scene.objects.length,1);
  assert.ok(label.rectangles.length>first);
  label.setText('1'); assert.equal(label.rectangles.length,first);
  const clears=label.clears; label.setText('1'); assert.equal(label.clears,clears);
  assert.ok(label.pixelMetrics.width<=160);
});

test('all real conversation questions and choices fit both viewports without changing content', () => {
  for(const [width,height] of viewports) for(const character of patioWomen) {
    for(const [beatIndex,beat] of character.conversation.beats.entries()) {
      const scene=makeUiScene(width,height);
      const ui=createDialogueQuestionUi(scene,{character,beat,beatIndex,totalBeats:4,councilAvailable:true});
      const choices=scene.objects.filter(o=>/^choice-\d/.test(o.uiRole??''));
      assert.ok(choices.every(o=>!o.visible));
      ui.update({entry:{text:beat.prompt},text:beat.prompt,complete:true});
      assert.deepEqual(choices.map(o=>o.text),beat.choices.map(c=>c.text));
      assert.ok(choices.every(o=>o.visible));
      assertUiFits(assert,scene);
      const progress=scene.objects.find(o=>o.uiRole==='question-progress');
      assert.equal(progress.text,`${beatIndex+1} / 4`);
      const help=scene.objects.find(o=>o.uiRole==='question-help');
      assert.match(help.text,/1-4/); assert.match(help.text,/ESC/);
      destroyDialogueUi(ui); assert.ok(scene.objects.every(o=>o.destroyCount===1));
    }
  }
});

test('reaction/post-outcome and Council preserve exact speech and mode-specific prompts', () => {
  for(const [width,height] of viewports) for(const character of patioWomen) {
    const scene=makeUiScene(width,height);
    const reaction=createDialogueReactionUi(scene,false,{completionInstruction:'ENTER / SPACE · CERRAR'});
    for(const sequence of Object.values(character.conversation.postOutcomeReactions)) for(const entry of sequence) {
      reaction.update({entry,text:entry.text,complete:true});
      assert.equal(scene.objects.find(o=>o.uiRole==='reaction-body').text,entry.text);
      assert.ok(!scene.objects.some(o=>/^choice-/.test(o.uiRole??'')));
      assert.match(scene.objects.find(o=>o.uiRole==='reaction-help').text,/CERRAR/);
      assertUiFits(assert,scene);
    }
    destroyDialogueUi(reaction);
    const selection=createCouncilSelectionUi(scene,character.conversation.council.members);
    assertUiFits(assert,scene);destroyDialogueUi(selection);
    const member=character.conversation.council.members[0];
    const advice=createCouncilAdviceUi(scene,member);
    const entry={speaker:'TAMBU',text:'¿Rarillo qué, boludo?'};
    advice.update({entry,text:entry.text,complete:true});
    assert.equal(scene.objects.findLast(o=>o.uiRole==='advice-body').text,`“${entry.text}”`);
    assertUiFits(assert,scene);destroyDialogueUi(advice);
    assert.ok(scene.objects.every(o=>o.destroyCount===1));
  }
});

test('outcomes show actual consequences and bathroom pending, without UI emojis or early +500', () => {
  for(const [width,height] of viewports) for(const character of patioWomen) for(const outcome of Object.values(character.conversation.outcomes)) {
    const scene=makeUiScene(width,height), before=JSON.stringify(outcome);
    const ui=createOutcomeUi(scene,outcome);
    assert.ok(scene.objects.some(o=>o.text===formatOutcomeReward(outcome)));
    assert.ok(scene.objects.every(o=>!/[♥★🚻📱💀👋]/u.test(o.text)));
    assertUiFits(assert,scene);
    assert.equal(JSON.stringify(outcome),before);
    destroyDialogueUi(ui);assert.ok(scene.objects.every(o=>o.destroyCount===1));
    if(outcome.event) {
      const initial=createOutcomeEventUi(scene,outcome);
      assert.ok(initial.some(o=>o.text==='RECOMPENSA PENDIENTE'));
      assert.ok(initial.every(o=>!String(o.text).includes('+500')));
      assertUiFits(assert,scene);initial.forEach(o=>o.destroy());
    }
  }
});

test('Bathroom composite fits both viewports with unchanged reaction content and resolution gating', () => {
  for(const [width,height] of viewports)for(const attemptNumber of [1,2,3]) {
    const scene=makeUiScene(width,height), config=getBathroomResistanceConfig(attemptNumber);
    const narrative=getBathroomResistanceNarrative({attemptNumber,previousResults:Array(attemptNumber-1).fill('secured')});
    const ui=createBathroomChallengeUi(scene,config);
    ui.startResistance();
    for(const reaction of [...narrative.anticipation,...narrative.hits].filter(r=>r.speaker)) {
      ui.update({state:{resistance:55,elapsedMs:4000},presentation:reaction});
      assert.equal(ui.getView().reaction,reaction);assertUiFits(assert,scene);
    }
    ui.showResolution('failure',{rewardSettled:true,reaction:narrative.resolution.failure});
    assert.equal(ui.getView().reward,'+250 PUNTOS');
    assert.equal(ui.getView().labels.help,undefined);assert.equal(ui.getView().ready,false);
    ui.setReady();assert.equal(ui.getView().labels.help,'ENTER · VOLVER AL PATIO');
    assertUiFits(assert,scene);ui.destroy();scene.events.emit('shutdown');
    assert.ok(scene.objects.every(o=>o.destroyCount===1));
  }
});


const hooks = registerHooks({resolve(specifier, context, next) {
  return specifier === 'phaser' ? {shortCircuit:true, url:'data:text/javascript,'+encodeURIComponent(`
    export default {Input:{Keyboard:{KeyCodes:{ENTER:13,SPACE:32},
      JustDown(key){const value=key.justDown;key.justDown=false;return value;}}}};
  `)} : next(specifier,context);
}});
const {createGameOverUi,GAME_OVER_TIMINGS} = await import('../src/ui/gameOverUi.js');
const {createPerfectNightUi,PERFECT_NIGHT_TIMINGS} = await import('../src/ui/perfectNightUi.js');
const {createNormalEndUi,NORMAL_END_TIMINGS} = await import('../src/ui/normalEndUi.js');
hooks.deregister();

test('terminal layouts fit at both sizes, keep their beats and require fresh input after readiness', () => {
  for(const [width,height] of viewports)for(const kind of ['game-over','perfect','normal']) {
    const scene=makeUiScene(width,height), hud={setVisible(){}}, actions=[];
    const summary={points:1500,relationships:{sofi:{outcome:'instagram'},
      mili:{outcome:'bathroom',bathroomResult:'interrupted'},cami:{outcome:'rejection'}}};
    const ui=kind==='game-over'?createGameOverUi(scene,{hud,onRetry:()=>actions.push('retry')})
      :kind==='perfect'?createPerfectNightUi(scene,{hud,onContinue:()=>{actions.push('continue');return true;}})
      :createNormalEndUi(scene,{hud,onReplay:()=>actions.push('replay')});
    ui.show(summary);
    const beat=kind==='game-over'?GAME_OVER_TIMINGS.punchlineDelay:kind==='perfect'
      ?PERFECT_NIGHT_TIMINGS.victoryBeat:NORMAL_END_TIMINGS.patioBeat;
    const prompt=kind==='game-over'?GAME_OVER_TIMINGS.retryPromptDelay:kind==='perfect'
      ?PERFECT_NIGHT_TIMINGS.continuePrompt:NORMAL_END_TIMINGS.replayPrompt;
    scene.keys.get(13).justDown=true;ui.update(beat-1);assert.equal(ui.isVisible(),false);
    ui.update(1);assert.equal(ui.isVisible(),true);assert.equal(actions.length,0);
    scene.keys.get(32).justDown=true;ui.update(prompt);assert.equal(actions.length,0);
    assertUiFits(assert,scene);ui.update(0);assert.equal(actions.length,0);
    if(kind==='normal') {
      const longResult=scene.objects.find(o=>o.text==='BAÑO INTERRUMPIDO');
      assert.ok(longResult);assert.equal(longResult.pixelAlign,'left');
      const right=longResult.x+longResult.pixelMetrics.width;
      assert.ok(right<=width*0.88-16, 'longest outcome fits its own column');
      const rules=scene.objects.filter(o=>o.type==='graphics' && !o.pixelMetrics);
      assert.ok(rules.some(o=>o.rectangles.filter(([, , w,h])=>w>width*0.7 && h<=3).length===3),
        'header and both internal horizontal row dividers are continuous');
    }
    scene.keys.get(13).justDown=true;ui.update(0);assert.equal(actions.length,1);
    ui.update(0);assert.equal(actions.length,1);ui.destroy();ui.destroy();
    assert.ok(scene.objects.every(o=>o.destroyCount===1));
  }
});
