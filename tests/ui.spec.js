import {test,expect} from '@playwright/test';

test('landing page presents hero, sections and animated trace',async({page})=>{
 await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await expect(page.getByRole('heading',{name:/Follow the whole feature/i})).toBeVisible();
 await expect(page.locator('.landing-path-node')).toHaveCount(3);
 await expect(page.locator('.landing-evidence')).toBeVisible();
 await page.getByRole('link',{name:'Sign in'}).first().click();
 await expect(page.getByRole('heading',{name:'Sign in'})).toBeVisible();
});

async function loginAs(page){
 await page.goto('/#login');
 await page.getByLabel('Email').fill('demo@featuretrace.dev');
 await page.getByLabel('Password',{exact:true}).fill('FeatureTrace!2026');
 await page.getByRole('button',{name:'Continue'}).click();
 await expect(page.getByRole('heading',{name:/Meet your code/})).toBeVisible();
}

test('master-password login rejects invalid credentials',async({page})=>{
 await page.goto('/#login');
 const passwordBox=await page.locator('.password-wrap').boundingBox();
 const continueBox=await page.getByRole('button',{name:'Continue'}).boundingBox();
 expect(passwordBox.y+passwordBox.height).toBeLessThan(continueBox.y);
 expect(continueBox.y-(passwordBox.y+passwordBox.height)).toBeGreaterThanOrEqual(16);
 await page.getByLabel('Email').fill('demo@featuretrace.dev');
 await page.getByLabel('Password',{exact:true}).fill('wrong-password');
 await page.getByRole('button',{name:'Continue'}).click();
 await expect(page.getByText('Incorrect master password')).toBeVisible();
 await page.getByLabel('Password',{exact:true}).fill('FeatureTrace!2026');
 await page.getByRole('button',{name:'Continue'}).click();
 await expect(page.getByRole('heading',{name:/Meet your code/})).toBeVisible();
});

test('authenticated user saves and removes a repository project',async({page})=>{
 await loginAs(page);
 await page.getByLabel('Repository').fill('https://github.com/example/shop');
 await page.getByRole('button',{name:'Save repository'}).click();
 await expect(page.getByRole('heading',{name:'Start with the source.'})).toBeVisible();
 await page.getByRole('button',{name:'Change project'}).click();
 await expect(page.getByText('example/shop')).toBeVisible();
 await page.getByRole('button',{name:'Remove shop'}).click();
 await expect(page.getByText('example/shop')).toHaveCount(0);
});

test('saving a project opens the public repository workspace',async({page})=>{
 await loginAs(page);
 await page.getByLabel('Repository').fill('https://github.com/example/shop');
 await page.getByRole('button',{name:'Save repository'}).click();
 await expect(page.getByRole('heading',{name:'Start with the source.'})).toBeVisible();
 await expect(page.getByText(/Repository not found|Loading repository|supported text files/).first()).toBeVisible();
});

test('mobile layout and persistent theme remain usable',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await loginAs(page);
 await page.getByRole('button',{name:'Switch to light mode'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
