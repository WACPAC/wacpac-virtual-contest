import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedProblemInfo {
  name: string;
  submissionUrl: string;
}

export interface ScrapedSubmission {
  submissionId: string;
  status: string;
  submittedAt: Date;
  userId: string;
}

export class ScrapingService {
  static async scrapeProblemInfo(problemUrl: string): Promise<ScrapedProblemInfo> {
    try {
      console.log("*** ACCESS ***");
      const response = await axios.get(problemUrl);
      const $ = cheerio.load(response.data);
      
      // Extract problem name from span.h2 (例: "A - Vacation Validation")
      const problemName = $('title').text().replace(' - AtCoder', '').trim();
      
      // Extract contest_id and problem_id from URL
      const urlMatch = problemUrl.match(/contests\/([^\/]+)\/tasks\/([^\/]+)/);
      if (!urlMatch) {
        throw new Error('Invalid problem URL format');
      }
      
      const [, contestId, taskId] = urlMatch;
      const submissionUrl = `https://atcoder.jp/contests/${contestId}/submissions?f.LanguageName=&f.Status=&f.Task=${taskId}&f.User=&page=1`;
      
      return {
        name: problemName,
        submissionUrl,
      };
    } catch (error) {
      console.error('Failed to scrape problem info:', error);
      throw new Error('問題情報の取得に失敗しました');
    }
  }

  static async scrapeSubmissions(
    submissionUrl: string, 
    userIds: string[], 
    contestStartTime?: Date,
    contestEndTime?: Date
  ): Promise<ScrapedSubmission[]> {
    console.log(`=== scrapeSubmissions START for URL: ${submissionUrl} ===`);
    const submissions: ScrapedSubmission[] = [];
    let currentPage = 1;
    let shouldContinue = true;

    while (shouldContinue) {
      try {
        console.log(`Processing page ${currentPage}, shouldContinue: ${shouldContinue}`);
        const pageUrl = submissionUrl.replace(/page=\d+/, `page=${currentPage}`);
        
        // Configure axios with AtCoder session cookie if available
        const config: any = {};
        if (process.env.REVEL_SESSION) {
          console.log('REVEL_SESSION is set')
          config.headers = {
            'Cookie': `REVEL_SESSION=${process.env.REVEL_SESSION}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          };
        }
        
        const response = await axios.get(pageUrl, config);
        const $ = cheerio.load(response.data);
        
        // Find the submissions table - look for table with class "table table-bordered table-striped small th-center"
        const rows = $('.table.table-bordered.table-striped tbody tr');
        let hasValidSubmissions = false;

        console.log(`Page ${currentPage}: Found ${rows.length} rows`);

        if (rows.length === 0) {
          console.log(`Page ${currentPage}: No rows found, stopping`);
          shouldContinue = false;
          break;
        }

        rows.each((_, row) => {
          const $row = $(row);
          const cells = $row.find('td');
          
          if (cells.length < 8) return;

          // Extract data based on the actual HTML structure:
          // 0: 提出日時 (submission time)
          // 1: 問題 (problem)
          // 2: ユーザ (user)
          // 3: 言語 (language)
          // 4: 得点 (score)
          // 5: コード長 (code length)
          // 6: 結果 (status)
          // 7: 実行時間 (execution time)
          // 8: メモリ (memory)
          // 9: 詳細リンク (details link)

          const submissionTimeText = $(cells[0]).find('time.fixtime').text().trim();
          const userLink = $(cells[2]).find('a').first();
          const userId = userLink.text().trim();
          const statusSpan = $(cells[6]).find('span.label');
          const status = statusSpan.text().trim();
          const detailsLink = $(cells[9]).find('a.submission-details-link');
          const submissionId = detailsLink.attr('href')?.split('/').pop() || '';

          // Parse submission time (format: "2025-07-30 20:44:02+0900")
          let submissionTime: Date;
          try {
            submissionTime = new Date(submissionTimeText);
          } catch (error) {
            console.error('Failed to parse submission time:', submissionTimeText);
            return;
          }

          // Check if submission is before contest start (if provided) - stop processing
          if (contestStartTime && submissionTime < contestStartTime) {
            shouldContinue = false;
            return false; // Break out of each loop
          }

          // Check if submission is after contest end (if provided) - stop processing
          if (contestEndTime && submissionTime > contestEndTime) {
            console.log(`Found submission after contest end - stopping pagination`);
            shouldContinue = false;
            return false; // Break out of each loop
          }

          // Check if this submission is from our contest users
          if (userIds.includes(userId)) {
            // Skip CE (Compilation Error) submissions
            if (status !== 'CE' && submissionId) {
              submissions.push({
                submissionId,
                status,
                submittedAt: submissionTime,
                userId,
              });
              hasValidSubmissions = true;
            }
          }
        });
        
        console.log(`Page ${currentPage}: After processing rows, shouldContinue: ${shouldContinue}`);
        
        // Check if there's a "Next >" link to determine if we should continue
        const nextLink = $('.pager li a').filter((_, link) => $(link).text().includes('Next'));
        if (nextLink.length === 0) {
          console.log(`Page ${currentPage}: No Next link found`);
          shouldContinue = false;
        } else if (!hasValidSubmissions) {
          console.log(`Page ${currentPage}: No valid submissions found`);
          shouldContinue = false;
        } else {
          console.log(`Page ${currentPage}: Continuing to next page`);
          currentPage++;
        }

        // Add a small delay to be respectful to5AtCoder's servers
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Failed to scrape submissions from page ${currentPage}:`, error);
        shouldContinue = false;
      }
    }

    console.log(`=== scrapeSubmissions END - Found ${submissions.length} submissions ===`);
    return submissions;
  }
} 